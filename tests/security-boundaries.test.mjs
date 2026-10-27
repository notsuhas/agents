import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnvFromDir } from "../packages/hyperframes/media-use/audio/scripts/lib/heygen.mjs";
import { recordInManifest, voicePaths } from "../packages/hyperframes/media-use/audio/scripts/lib/media-record.mjs";
import { record } from "../scripts/expense-sync/core.ts";

function project(t) {
  const dir = mkdtempSync(join(tmpdir(), "security-boundary-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("project credentials cannot configure host executables or runtime hooks", (t) => {
  const dir = project(t);
  const values = { HEYGEN_API_KEY: "dummy-project-key", HYPERFRAMES_PYTHON: "/untrusted/probe", PYTHONPATH: "/untrusted/modules", NODE_OPTIONS: "--import=/untrusted/hook.mjs", HEYGEN_API_BASE: "https://untrusted.invalid", HEYGEN_CONFIG_DIR: "/untrusted/credentials" };
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  for (const key of Object.keys(values)) delete process.env[key];
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  writeFileSync(join(dir, ".env"), Object.entries(values).map(([key, value]) => `${key}=${value}`).join("\n"));
  loadEnvFromDir(dir);
  assert.equal(process.env.HEYGEN_API_KEY, "dummy-project-key");
  for (const key of Object.keys(values).filter(key => key !== "HEYGEN_API_KEY")) assert.equal(process.env[key], undefined, key);
  process.env.HEYGEN_API_KEY = "dummy-host-key";
  loadEnvFromDir(dir);
  assert.equal(process.env.HEYGEN_API_KEY, "dummy-host-key");
});

test("voice IDs cannot select paths or duplicate destinations", (t) => {
  const dir = project(t);
  for (const id of ["../../../outside/probe", "..\\outside\\probe", "", "/absolute", "a/b", ".", ".."])
    assert.throws(() => voicePaths(dir, [{ id, text: "Dummy narration" }], []), /voice.*id/i);
  assert.throws(() => voicePaths(dir, [{ id: "intro", text: "One" }, { id: "intro", text: "Two" }], []), /voice.*id/i);
  assert.deepEqual(Object.fromEntries(voicePaths(dir, [{ id: "intro-01", text: "Dummy narration" }], [])), { "intro-01": "assets/voice/intro-01.wav" });
});

test("voice allocation rejects symlink parents and manifest-approved symlink files", (t) => {
  const dir = project(t);
  const outside = project(t);
  symlinkSync(outside, join(dir, "assets"), "dir");
  assert.throws(() => voicePaths(dir, [{ id: "intro", text: "Dummy" }], []), /voice.*path/i);
  rmSync(join(dir, "assets"));
  mkdirSync(join(dir, "assets/voice"), { recursive: true });
  writeFileSync(join(outside, "kept.wav"), "user-owned audio");
  symlinkSync(join(outside, "kept.wav"), join(dir, "assets/voice/intro.wav"));
  recordInManifest(dir, [{ path: "assets/voice/intro.wav", type: "voice", source: "generated" }]);
  assert.throws(() => voicePaths(dir, [{ id: "intro", text: "Dummy" }], []), /voice.*path/i);
});

test("unknown expense shares fail before any account read or write", async () => {
  const profile = { nomadApp: "dummy", homelabApp: "dummy", trip: "dummy", group: "dummy", event: "dummy", nomadOtherName: "Other", members: { me: "User", other: "Other" }, wallets: { cash: { name: "Cash", currency: "JPY" } } };
  const receipt = { id: "dummy-123", merchant: "Dummy receipt", amount: 100, currency: "JPY", dateTime: "2026-10-20T12:00:00Z", wallet: "cash", paidBy: "me", shares: { me: 100, other: 0, extra: 25 }, category: "other", moneyloverCategory: "Other" };
  let calls = 0;
  const unexpected = async () => { calls++; throw new Error("Unexpected account call"); };
  await assert.rejects(record(profile, receipt, { read: unexpected, call: unexpected }), /share/i);
  assert.equal(calls, 0);
});
