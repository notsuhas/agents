#!/usr/bin/env bun
import { record, validate, type IProfile, type IReceipt, type IAdapter } from "./core";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  const option = (name: string) => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
  if (!mode || mode === "--help") {
    console.log("expense-sync plan|host|record --input receipt.json [--profile profile.json] [--adapter adapter.ts]\n\nplan: validate without account calls\nhost: emit a bundle for the existing authenticated Upsy tools\nrecord: execute using an authenticated adapter module exporting read/call\n\nUse a stable receipt ID on every retry. Transfers and HO bookings are not expense imports.");
    return;
  }
  const input = option("--input");
  if (!input) throw new Error("--input is required");
  const profilePath = option("--profile") ?? `${homedir()}/.config/expense-sync/profile.json`;
  const profile = await Bun.file(profilePath).json() as IProfile;
  profile.receiptLedgerPath = resolve(dirname(profilePath), "receipt-ledger.json");
  const ledger = Bun.file(profile.receiptLedgerPath);
  profile.receipts = await ledger.exists() ? await ledger.json() : {};
  const receipt = await Bun.file(input).json() as IReceipt;
  validate(profile, receipt);
  if (mode === "plan") { console.log(JSON.stringify({ profile: { group: profile.group }, receipt, writes: receipt.funding !== "ho" }, null, 2)); return; }
  if (mode === "host") {
    const build = await Bun.build({ entrypoints: [resolve(import.meta.dir, "host.ts")], target: "browser", format: "cjs", write: false });
    if (!build.success) throw new Error(build.logs.join("\n"));
    console.log(JSON.stringify({ code: await build.outputs[0].text(), profile, receipt }));
    return;
  }
  if (mode !== "record") throw new Error("Choose plan, host or record.");
  const adapter = option("--adapter");
  if (!adapter) throw new Error("Use host mode with the existing Upsy connection, or provide an authenticated --adapter module. No credentials are copied by this helper.");
  const api = await import(resolve(adapter)) as IAdapter;
  const result = await record(profile, receipt, api);
  if (result.status === "verified") {
    profile.receipts![receipt.id] = result.apps;
    await Bun.write(profile.receiptLedgerPath, JSON.stringify(profile.receipts, null, 2));
    await import("node:fs/promises").then(fs => fs.chmod(profile.receiptLedgerPath!, 0o600));
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => { console.error(JSON.stringify({ status: "incomplete", error: error.message, recovery: "Rerun with the same receipt ID after checking any permission/provider error." })); process.exitCode = 1; });
