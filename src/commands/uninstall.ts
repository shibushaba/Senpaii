import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import path from "node:path";
import { readManifest } from "../lib/manifest.js";
import { uninstallManagedFiles } from "../lib/installer.js";

export async function runUninstall(target = ".", options: { yes?: boolean; dryRun?: boolean } = {}): Promise<void> {
  const root = path.resolve(target);
  const manifest = await readManifest(root);
  if (!manifest) { stdout.write("No CDK manifest found; nothing to uninstall.\n"); return; }
  if (options.dryRun) {
    stdout.write(`Would inspect and remove up to ${Object.keys(manifest.files).length} CDK-managed files. Locally modified files would be preserved.\n`);
    return;
  }
  let approved = options.yes === true;
  if (!approved && stdin.isTTY && stdout.isTTY) {
    const rl = createInterface({ input: stdin, output: stdout });
    try { approved = ["y", "yes"].includes((await rl.question("Remove unchanged CDK-managed files? [y/N] ")).trim().toLowerCase()); }
    finally { rl.close(); }
  }
  if (!approved) { stdout.write("Nothing changed. Re-run with --yes to confirm uninstall.\n"); return; }
  const result = await uninstallManagedFiles(root);
  stdout.write(`Uninstall complete. Removed: ${result.removed}; preserved local modifications: ${result.preserved}. User-owned files were not touched.\n`);
}
