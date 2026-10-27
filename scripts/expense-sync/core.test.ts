import { expect, test } from "bun:test";
import { record, type IProfile, type IReceipt } from "./core";

const profile: IProfile = {
  nomadApp: "nomad", homelabApp: "homelab", trip: "trip", group: "group", event: "event", nomadOtherName: "Other",
  members: { me: "User", other: "Other" },
  wallets: { suica: { name: "Suica", currency: "JPY", pocket: "prepaid" }, card: { name: "Card", currency: "INR" } },
};
const receipt: IReceipt = { id: "receipt-123", merchant: "Station fare", amount: 155, currency: "JPY", dateTime: "2026-10-20T22:59:00+09:00", wallet: "suica", paidBy: "me", shares: { me: 155, other: 0 }, category: "travel", moneyloverCategory: "Transport" };

function fixture() {
  delete profile.receipts;
  const su: any[] = [], ml: any[] = [], nomad: any[] = [];
  let count = 0, failAfterNomadCommit = false;
  const api = {
    read: async () => ({ spends: nomad }),
    call: async (_app: string, tool: string, args: any) => {
      if (tool === "apply_changes") {
        for (const op of args.ops) {
          const id = `nomad-${++count}`;
          const people = op.split.people ?? Object.keys(op.split.amounts);
          nomad.push({ ...op, id, date: op.date, split: { shares: op.split.amounts ?? Object.fromEntries(people.map((p: string) => [p, op.amount / people.length])) } });
        }
        if (failAfterNomadCommit) { failAfterNomadCommit = false; throw new Error("Connection lost after commit"); }
        return { saved: true };
      }
      const a = args.args;
      const list = args.server === "settleup" ? su : ml;
      if (args.toolName === "search_transactions") {
        const filter = a.note ?? a.purpose;
        const transactions = list.filter(row => !filter || (row.note ?? row.purpose).includes(filter));
        return { matched: transactions.length, returned: transactions.length, transactions };
      }
      if (args.toolName === "add_expense") {
        const row = { id: `su-${++count}`, amount: a.amount, currency: a.currencyCode, paidBy: a.paidBy, forWhom: a.forWhom, purpose: a.purpose, dateTime: a.dateTime };
        su.push(row); return { created: row.id };
      }
      const row = { ...a, id: `ml-${++count}`, category: a.category ?? (a.kind === "lend" ? "Loan" : "Debt Collection"), amount: a.kind === "lend" ? -a.amount : a.amount, people: a.person ? [a.person] : [] };
      ml.push(row); return { transaction: row };
    },
  };
  return { api, su, ml, nomad, failNextNomadCommit: () => { failAfterNomadCommit = true; } };
}

test("personal prepaid fare is written once, verified, and reused on rerun", async () => {
  const f = fixture();
  expect((await record(profile, receipt, f.api)).status).toBe("verified");
  expect(f.nomad[0].pocketId).toBe("prepaid");
  expect(f.su[0].forWhom).toEqual(["User"]);
  expect(f.ml[0].amount).toBe(-155);
  expect((await record(profile, receipt, f.api)).reused).toBe(true);
  expect([f.su.length, f.ml.length, f.nomad.length]).toEqual([1, 1, 1]);
});

test("a committed write with lost response resumes without duplicate money", async () => {
  const f = fixture(); f.failNextNomadCommit();
  await expect(record(profile, receipt, f.api)).rejects.toThrow("Connection lost");
  expect([f.su.length, f.ml.length, f.nomad.length]).toEqual([1, 0, 1]);
  await record(profile, receipt, f.api);
  expect([f.su.length, f.ml.length, f.nomad.length]).toEqual([1, 1, 1]);
  const mutated = { ...receipt, amount: 200, shares: { me: 200, other: 0 } };
  await expect(record(profile, mutated, f.api)).rejects.toThrow("conflicts");
  expect([f.su.length, f.ml.length, f.nomad.length]).toEqual([1, 1, 1]);
});

test("other-paid unequal receipt preserves beneficiaries and offsets only the user's share", async () => {
  const f = fixture();
  await record(profile, { ...receipt, amount: 713, paidBy: "other", shares: { me: 214, other: 499 }, category: "food", moneyloverCategory: "Food" }, f.api);
  expect(f.su.map(row => [row.amount, row.forWhom])).toEqual([[214, ["User"]], [499, ["Other"]]]);
  expect(f.nomad[0].split.shares).toEqual({ me: 214, Other: 499 });
  expect(f.nomad[0].pocketId).toBeUndefined();
  expect(f.ml.map(row => row.amount)).toEqual([-214, 214]);
  expect(f.ml[1].people).toEqual(["Other"]);
});

test("invalid card currency and HO funding cannot create expenses", async () => {
  const f = fixture();
  await expect(record(profile, { ...receipt, wallet: "card" }, f.api)).rejects.toThrow("Wallet currency");
  await expect(record(profile, { ...receipt, dateTime: "2026-02-30T12:00:00+09:00" }, f.api)).rejects.toThrow("calendar day");
  expect((await record(profile, { ...receipt, funding: "ho" }, f.api)).status).toBe("excluded");
  expect([f.su.length, f.ml.length, f.nomad.length]).toEqual([0, 0, 0]);
});

test("wrong saved timestamps and individual shares are rejected before writes", async () => {
  const f = fixture();
  await record(profile, receipt, f.api);
  f.nomad[0].date = "2026-10-20T00:00:00Z";
  await expect(record(profile, receipt, f.api)).rejects.toThrow("timestamp");
  f.nomad[0].date = receipt.dateTime;
  f.nomad[0].split.shares.me = 150;
  await expect(record(profile, receipt, f.api)).rejects.toThrow("share");
  expect([f.su.length, f.ml.length, f.nomad.length]).toEqual([1, 1, 1]);
});

test("legacy entries carrying the same receipt reference are reused", async () => {
  const f = fixture();
  await record(profile, receipt, f.api);
  f.su[0].purpose = `Old fare receipt ${receipt.id}`;
  f.ml[0].note = `Old fare receipt ${receipt.id}`;
  f.nomad[0].note = `Old fare receipt ${receipt.id}`;
  expect((await record(profile, receipt, f.api)).reused).toBe(true);
  expect([f.su.length, f.ml.length, f.nomad.length]).toEqual([1, 1, 1]);
});

test("visible details exclude audit text and private IDs survive note cleanup", async () => {
  const f = fixture();
  const input = { ...receipt, note: "User confirms; source timestamp; internal reconciliation." };
  await record(profile, input, f.api);
  expect(f.su[0].purpose).toBe("Station fare");
  expect(f.ml[0].note).toBe("Station fare");
  expect(f.nomad[0].note).toBe("Station fare");
  f.su[0].purpose = "Train journey";
  f.ml[0].note = "Train journey";
  f.nomad[0].note = null;
  expect((await record(profile, input, f.api)).reused).toBe(true);
  expect([f.su.length, f.ml.length, f.nomad.length]).toEqual([1, 1, 1]);
});

test("a missing indexed transaction is never silently recreated", async () => {
  const f = fixture();
  await record(profile, receipt, f.api);
  f.ml.length = 0;
  await expect(record(profile, receipt, f.api)).rejects.toThrow("refusing to recreate");
  expect([f.su.length, f.ml.length, f.nomad.length]).toEqual([1, 0, 1]);
});
