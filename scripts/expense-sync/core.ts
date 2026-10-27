export interface IProfile {
  nomadApp: string;
  homelabApp: string;
  trip: string;
  group: string;
  nomadOtherName: string;
  event: string;
  receipts?: Record<string, { settleup: string[]; moneylover: string[]; nomad?: string }>;
  receiptLedgerPath?: string;
  members: { me: string; other: string };
  wallets: Record<string, { name: string; currency: string; pocket?: string }>;
}

export interface IReceipt {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  dateTime: string;
  wallet: string;
  paidBy: "me" | "other";
  shares: { me: number; other: number };
  category: "food" | "stays" | "travel" | "shopping" | "fees" | "other";
  moneyloverCategory: string;
  original?: { amount: number; currency: string };
  note?: string;
  details?: string;
  funding?: "cash" | "card" | "ho";
}

export interface IAdapter {
  read(app: string, tool: string, args: Record<string, unknown>): Promise<unknown>;
  call(app: string, tool: string, args: Record<string, unknown>): Promise<unknown>;
}

type IRow = Record<string, any>;

export function unwrap(value: any): any {
  if (value?.isError) throw new Error(JSON.stringify(value.content));
  if (value?.structuredContent && Object.keys(value.structuredContent).length) return unwrap(value.structuredContent);
  if (value?.result) return unwrap(value.result);
  const text = value?.content?.find((item: any) => item.type === "text")?.text;
  if (text !== undefined) {
    try { return unwrap(JSON.parse(text)); } catch (error) {
      if (error instanceof SyntaxError) throw new Error(text);
      throw error;
    }
  }
  return value;
}

export function validate(profile: IProfile, receipt: IReceipt): void {
  if (!receipt.shares || Array.isArray(receipt.shares) || Object.keys(receipt.shares).some(key => key !== "me" && key !== "other")) throw new Error("Shares must contain only me and other.");
  if (!/^[a-zA-Z0-9_.:-]{3,64}$/.test(receipt.id)) throw new Error("Use a stable receipt ID or bank reference (3–64 letters, digits, dots, colons, hyphens).");
  if (!receipt.merchant?.trim() || !Number.isFinite(receipt.amount) || receipt.amount <= 0) throw new Error("Merchant and positive amount are required.");
  if (!/^[A-Z]{3}$/.test(receipt.currency)) throw new Error("Currency must be an ISO code.");
  if (!/T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(receipt.dateTime) || !Number.isFinite(Date.parse(receipt.dateTime))) throw new Error("Use a full ISO timestamp with an explicit timezone.");
  const date = receipt.dateTime.slice(0, 10);
  const [year, month, day] = date.split("-").map(Number);
  if (new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) !== date) throw new Error("Payment date is not a real calendar day.");
  if (!["me", "other"].includes(receipt.paidBy)) throw new Error("Unknown payer.");
  if (!profile.wallets[receipt.wallet] || profile.wallets[receipt.wallet].currency !== receipt.currency) throw new Error("Wallet currency must match the actual charged amount; supply the actual INR debit for INR cards.");
  if (![receipt.shares.me, receipt.shares.other].every(n => Number.isFinite(n) && n >= 0) || Math.abs(receipt.shares.me + receipt.shares.other - receipt.amount) > 0.00001) throw new Error("Explicit personal shares must add up to the amount.");
  if (!["food", "stays", "travel", "shopping", "fees", "other"].includes(receipt.category) || !receipt.moneyloverCategory?.trim()) throw new Error("Both category mappings are required.");
}

function rows(result: any): IRow[] {
  if (!Array.isArray(result?.transactions) || result.matched > result.returned) throw new Error("Incomplete transaction search; refusing to write.");
  return result.transactions;
}

function only(rows: IRow[], label: string): IRow | undefined {
  if (rows.length > 1) throw new Error(`Ambiguous duplicate records for ${label}; refusing to write.`);
  return rows[0];
}

function check(row: IRow, expected: IRow, label: string): void {
  for (const [key, value] of Object.entries(expected)) {
    const actual = row[key];
    const equal = key === "amount" ? Number(actual) === Number(value) : Array.isArray(value) ? JSON.stringify([...(actual ?? [])].sort()) === JSON.stringify([...value].sort()) : actual === value;
    if (!equal) throw new Error(`${label}: existing ${key} conflicts with this receipt; no overwrite attempted.`);
  }
}

function checkTime(value: unknown, expected: string, label: string): void {
  if (typeof value !== "string" || Date.parse(value) !== Date.parse(expected)) throw new Error(`${label}: payment timestamp conflicts with this receipt.`);
}

function checkNomad(row: IRow, receipt: IReceipt, profile: IProfile): void {
  check(row, { merchant: receipt.merchant, amount: receipt.amount, currency: receipt.currency, category: receipt.category, paidBy: receipt.paidBy === "me" ? "me" : profile.nomadOtherName }, "Nomad");
  checkTime(row.date, receipt.dateTime, "Nomad");
  const expected = Object.entries(receipt.shares).filter(([, amount]) => amount > 0);
  check({ people: Object.keys(row.split?.shares ?? {}) }, { people: expected.map(([person]) => person === "me" ? "me" : profile.nomadOtherName) }, "Nomad split");
  const tolerance = receipt.currency === "JPY" ? 0.500001 : 0.005001;
  for (const [person, amount] of expected) {
    const key = person === "me" ? "me" : profile.nomadOtherName;
    if (Math.abs(Number(row.split?.shares?.[key]) - amount) > tolerance) throw new Error("Nomad individual share verification failed.");
  }
  const pocket = profile.wallets[receipt.wallet].pocket;
  if (pocket && receipt.paidBy === "me" && row.pocketId !== pocket) throw new Error("Nomad pocket verification failed.");
}

export async function record(profile: IProfile, receipt: IReceipt, api: IAdapter): Promise<IRow> {
  validate(profile, receipt);
  if (receipt.funding === "ho") return { status: "excluded", reason: "HO credit is tracked outside expense apps", id: receipt.id };
  const marker = `[expense-sync:${receipt.id}]`;
  const wallet = profile.wallets[receipt.wallet];
  const names = profile.members;
  const payer = names[receipt.paidBy];
  const beneficiaries = (["me", "other"] satisfies (keyof IReceipt["shares"])[]).filter(p => receipt.shares[p] > 0);
  const sharedEqual = beneficiaries.length === 2 && Math.abs(receipt.shares.me - receipt.shares.other) < 0.00001;
  const note = receipt.details?.trim() || receipt.merchant;
  const binding = (profile.receipts ??= {})[receipt.id] ??= { settleup: [], moneylover: [] };
  const day = Date.parse(receipt.dateTime.slice(0, 10));
  const range = { from: new Date(day - 86400000).toISOString().slice(0, 10), to: new Date(day + 86400000).toISOString().slice(0, 10), limit: 200 };
  const sameTime = (value: string) => Date.parse(value) === Date.parse(receipt.dateTime);
  const mlNote = (tag: string) => `${note}${tag === "lend" ? ` — ${names.other}'s share` : tag === "offset" ? ` — paid by ${names.other} (offset)` : receipt.shares.other > 0 ? " — my share" : ""}`;
  const invoke = async (server: string, toolName: string, args: IRow) => unwrap(await api.call(profile.homelabApp, "tool_invoke", { server, toolName, args }));
  const matchingReference = (text: string) => text.includes(marker) || (!text.includes("[expense-sync:") && text.includes(receipt.id));
  const searchSU = async () => rows(await invoke("settleup", "search_transactions", { group: profile.group, ...range })).filter(row => binding.settleup.includes(row.id) || matchingReference(row.purpose ?? "") || (sameTime(row.dateTime) && row.purpose === note.slice(0, 100)));
  const searchML = async () => rows(await invoke("moneylover", "search_transactions", { ...range, wallet: wallet.name })).filter(row => binding.moneylover.includes(row.id) || matchingReference(row.note ?? "") || (sameTime(row.dateTime) && row.wallet === wallet.name && ["own", "lend", "offset"].some(tag => row.note === mlNote(tag))));
  const readNomad = async (): Promise<IRow[]> => {
    const all: IRow[] = [];
    let before: string | undefined;
    const seen = new Set<string>();
    do {
      const page = unwrap(await api.read(profile.nomadApp, "get_trip", { id: profile.trip, ...(before ? { before } : {}) }));
      if (!Array.isArray(page?.spends)) throw new Error("Nomad trip read failed; refusing to write.");
      all.push(...page.spends);
      before = page.moreSpendsBefore;
      if (before && seen.has(before)) throw new Error("Nomad repeated a pagination cursor.");
      if (before) seen.add(before);
    } while (before);
    return all.filter(row => row.id === binding.nomad || matchingReference(row.note ?? "") || (sameTime(row.date) && row.merchant === receipt.merchant && Number(row.amount) === receipt.amount && row.note === note));
  };
  const [existingSU, existingML, existingNomad] = await Promise.all([searchSU(), searchML(), readNomad()]);
  if (binding.settleup.some(id => !existingSU.some(row => row.id === id)) || binding.moneylover.some(id => !existingML.some(row => row.id === id)) || (binding.nomad && !existingNomad.some(row => row.id === binding.nomad))) throw new Error("Indexed expense is missing or moved; refusing to recreate it.");
  const suLegs = sharedEqual || beneficiaries.length === 1
    ? [{ tag: "expense", amount: receipt.amount, people: beneficiaries.map(p => names[p]) }]
    : beneficiaries.map(p => ({ tag: p, amount: receipt.shares[p], people: [names[p]] }));
  const mlLegs: IRow[] = [];
  if (receipt.shares.me > 0) mlLegs.push({ tag: "own", amount: -receipt.shares.me, category: receipt.moneyloverCategory });
  if (receipt.paidBy === "me" && receipt.shares.other > 0) mlLegs.push({ tag: "lend", amount: -receipt.shares.other, category: "Loan", kind: "lend" });
  if (receipt.paidBy === "other" && receipt.shares.me > 0) mlLegs.push({ tag: "offset", amount: receipt.shares.me, category: "Debt Collection", kind: "collect" });
  const findSU = (leg: IRow, list: IRow[]) => {
    const tagged = list.filter(row => row.purpose?.includes(`[leg:${leg.tag}]`));
    const legacy = list.filter(row => !row.purpose?.includes("[leg:") && JSON.stringify([...(row.forWhom ?? [])].sort()) === JSON.stringify([...leg.people].sort()));
    return only(tagged.length ? tagged : legacy, `Settle Up ${leg.tag}`);
  };
  const findML = (leg: IRow, list: IRow[]) => {
    const tagged = list.filter(row => row.note?.includes(`[leg:${leg.tag}]`));
    const legacy = list.filter(row => !row.note?.includes("[leg:") && row.category === leg.category && row.wallet === wallet.name);
    return only(tagged.length ? tagged : legacy, `Money Lover ${leg.tag}`);
  };
  const nomadExpected = { amount: receipt.amount, currency: receipt.currency, paidBy: receipt.paidBy === "me" ? "me" : profile.nomadOtherName };
  const nomadRow = only(existingNomad, "Nomad");
  if (nomadRow) checkNomad(nomadRow, receipt, profile);
  for (const leg of suLegs) {
    const row = findSU(leg, existingSU);
    if (row) {
      check(row, { amount: leg.amount, currency: receipt.currency, paidBy: [payer], forWhom: leg.people }, "Settle Up");
      checkTime(row.dateTime, receipt.dateTime, "Settle Up");
    }
  }
  for (const leg of mlLegs) {
    const row = findML(leg, existingML);
    if (row) {
      check(row, { amount: leg.amount, wallet: wallet.name, category: leg.category, ...(leg.kind ? { people: [names.other] } : {}) }, "Money Lover");
      checkTime(row.dateTime, receipt.dateTime, "Money Lover");
    }
  }
  if (existingSU.some(row => !suLegs.some(leg => findSU(leg, existingSU)?.id === row.id)) || existingML.some(row => !mlLegs.some(leg => findML(leg, existingML)?.id === row.id))) throw new Error("Unrecognised receipt legs; review before writing.");
  const created: string[] = [];
  for (const leg of suLegs) if (!findSU(leg, existingSU)) {
    const result = await invoke("settleup", "add_expense", { group: profile.group, amount: leg.amount, currencyCode: receipt.currency, dateTime: receipt.dateTime, paidBy: [payer], forWhom: leg.people, purpose: note.slice(0, 100) });
    if (!result?.created) throw new Error("Settle Up write uncertain; rerun the same receipt ID to reconcile, not a new ID.");
    created.push(`settleup:${result.created}`);
    binding.settleup.push(result.created);
  }
  if (!nomadRow) {
    const amounts: IRow = {};
    for (const person of beneficiaries) amounts[person === "me" ? "me" : profile.nomadOtherName] = receipt.shares[person];
    const split = sharedEqual || beneficiaries.length === 1 ? { mode: "equal", people: Object.keys(amounts) } : { mode: "custom", amounts };
    const result = unwrap(await api.call(profile.nomadApp, "apply_changes", { note: `Add ${receipt.merchant}.`, ops: [{ op: "expense_create", in: profile.trip, merchant: receipt.merchant, amount: receipt.amount, currency: receipt.currency, date: receipt.dateTime, category: receipt.category, paidBy: nomadExpected.paidBy, split, note, ...(wallet.pocket && receipt.paidBy === "me" ? { pocketId: wallet.pocket } : {}) }] }));
    if (!result?.saved) throw new Error("Nomad write uncertain; rerun the same receipt ID to reconcile.");
    created.push("nomad");
  }
  for (const leg of mlLegs) if (!findML(leg, existingML)) {
    const args = { wallet: wallet.name, dateTime: receipt.dateTime, eventId: profile.event, note: mlNote(leg.tag) };
    const result = leg.kind
      ? await invoke("moneylover", "record_lending", { ...args, kind: leg.kind, person: names.other, amount: Math.abs(leg.amount) })
      : await invoke("moneylover", "add_transaction", { ...args, category: leg.category, amount: leg.amount });
    if (!result?.transaction?.id) throw new Error(`Money Lover ${leg.tag} write uncertain; rerun the same receipt ID.`);
    created.push(`moneylover:${result.transaction.id}`);
    binding.moneylover.push(result.transaction.id);
  }
  const [finalSU, finalML, finalNomad] = await Promise.all([searchSU(), searchML(), readNomad()]);
  for (const leg of suLegs) {
    const row = findSU(leg, finalSU);
    if (!row) throw new Error("Settle Up verification failed; rerun the same receipt ID.");
    check(row, { amount: leg.amount, currency: receipt.currency, paidBy: [payer], forWhom: leg.people }, "Settle Up verification");
    checkTime(row.dateTime, receipt.dateTime, "Settle Up verification");
  }
  for (const leg of mlLegs) {
    const row = findML(leg, finalML);
    if (!row) throw new Error("Money Lover verification failed; rerun the same receipt ID.");
    check(row, { amount: leg.amount, wallet: wallet.name, category: leg.category, ...(leg.kind ? { people: [names.other] } : {}) }, "Money Lover verification");
    checkTime(row.dateTime, receipt.dateTime, "Money Lover verification");
  }
  const final = only(finalNomad, "Nomad verification");
  if (!final) throw new Error("Nomad verification failed; rerun the same receipt ID.");
  checkNomad(final, receipt, profile);
  if (finalSU.length !== suLegs.length || finalML.length !== mlLegs.length) throw new Error("Unexpected extra receipt legs; review before proceeding.");
  binding.settleup = finalSU.map(row => row.id);
  binding.moneylover = finalML.map(row => row.id);
  binding.nomad = final.id;
  return { status: "verified", id: receipt.id, created, reused: created.length === 0, amount: receipt.amount, currency: receipt.currency, apps: { settleup: finalSU.map(row => row.id), moneylover: finalML.map(row => row.id), nomad: final.id } };
}
