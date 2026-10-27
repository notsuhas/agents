import { record, type IProfile, type IReceipt } from "./core";

function quote(value: string): string {
  return "'" + value.replaceAll("'", "'\\''") + "'";
}

export async function run(tools: Record<string, any>, profile: IProfile, receipt: IReceipt) {
  const pendingPath = profile.receiptLedgerPath ? `${profile.receiptLedgerPath}.pending` : undefined;
  async function pending(action: "check" | "mark" | "clear") {
    if (!pendingPath) return;
    const script = "import json,sys,os; p,key,action=sys.argv[1:]; data=json.load(open(p)) if os.path.exists(p) else {}; blocked=key in data; data.update({key:True}) if action=='mark' else data.pop(key,None) if action=='clear' else None; print(json.dumps({'blocked':blocked})); fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600) if action!='check' else None; f=os.fdopen(fd,'w') if fd is not None else None; json.dump(data,f) if f else None; f.close() if f else None";
    const result = await tools.exec_command({ cmd: `python3 -c ${quote(script)} ${quote(pendingPath)} ${quote(receipt.id)} ${quote(action)}`, max_output_tokens: 200 });
    if (result.exit_code !== 0) throw new Error("Cannot check the private write journal.");
    if (action === "check" && JSON.parse(result.output).blocked) throw new Error("Previous write outcome is uncertain. Verify all three apps and reconcile the private write journal before retrying.");
  }
  await pending("check");
  const result = await record(profile, receipt, {
    read: (app, tool, args) => tools.mcp__upsy__app_read({ app, tool, arguments: args }),
    call: async (app, tool, args) => {
      if (tool === "apply_changes" || (tool === "tool_invoke" && ["add_expense", "add_transaction", "record_lending"].includes(args.toolName as string))) await pending("mark");
      return tools.mcp__upsy__app_call({ app, tool, arguments: args });
    },
  });
  if (result.status === "verified" && profile.receiptLedgerPath) {
    const script = "import json,sys,os; p=sys.argv[1]; data=json.load(open(p)) if os.path.exists(p) else {}; data[sys.argv[2]]=json.loads(sys.argv[3]); fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600); f=os.fdopen(fd,'w'); json.dump(data,f,indent=2); f.close(); os.chmod(p,0o600)";
    const saved = await tools.exec_command({ cmd: `python3 -c ${quote(script)} ${quote(profile.receiptLedgerPath)} ${quote(receipt.id)} ${quote(JSON.stringify(result.apps))}`, max_output_tokens: 200 });
    if (saved.exit_code !== 0) throw new Error("Expenses verified, but private receipt index could not be saved.");
    await pending("clear");
  }
  return result;
}
