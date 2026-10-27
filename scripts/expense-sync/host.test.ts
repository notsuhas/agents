import { expect, test } from "bun:test";
import { run } from "./host";
import type { IProfile, IReceipt } from "./core";

test("an uncertain write blocks a new host run before another account call", async () => {
  const profile: IProfile = { nomadApp: "nomad", homelabApp: "home", trip: "trip", group: "group", event: "event", nomadOtherName: "Other", members: { me: "User", other: "Other" }, wallets: { cash: { name: "Cash", currency: "JPY" } }, receiptLedgerPath: "/private/test-index.json" };
  const receipt: IReceipt = { id: "uncertain-123", merchant: "Fortune slip", amount: 200, currency: "JPY", dateTime: "2026-10-22T18:47:00+09:00", wallet: "cash", paidBy: "me", shares: { me: 200, other: 0 }, category: "other", moneyloverCategory: "Activities" };
  let blocked = false, accountCalls = 0, writes = 0;
  const tools = {
    exec_command: async (args: { cmd: string }) => {
      const wasBlocked = blocked;
      if (args.cmd.endsWith("'mark'")) blocked = true;
      if (args.cmd.endsWith("'clear'")) blocked = false;
      return { exit_code: 0, output: JSON.stringify({ blocked: wasBlocked }) };
    },
    mcp__upsy__app_read: async () => { accountCalls++; return { spends: [] }; },
    mcp__upsy__app_call: async (args: any) => {
      accountCalls++;
      if (args.arguments.toolName === "search_transactions") return { matched: 0, returned: 0, transactions: [] };
      writes++;
      throw new Error("Connection lost after commit");
    },
  };
  await expect(run(tools, profile, receipt)).rejects.toThrow("Connection lost");
  const callsAfterFailure = accountCalls;
  await expect(run(tools, profile, receipt)).rejects.toThrow("Previous write outcome is uncertain");
  expect(accountCalls).toBe(callsAfterFailure);
  expect(writes).toBe(1);
});
