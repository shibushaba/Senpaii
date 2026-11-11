import { access } from "node:fs/promises";
import path from "node:path";
import { stdout } from "node:process";
import { ENGINE_VERSION, readManifest } from "../lib/manifest.js";
import { detectProject } from "../lib/project.js";

export async function runDoctor(target = "."): Promise<void> {
  const root = path.resolve(target);
  const project = await detectProject(root);
  const checks: Array<{ label: string; ok: boolean; detail: string }> = [];
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  checks.push({ label: "Node.js", ok: nodeMajor >= 20, detail: `v${process.versions.node} (requires >=20)` });
  checks.push({ label: "Project directory", ok: true, detail: root });
  try {
    await access(path.join(root, ".cursor"));
    checks.push({ label: "Cursor integration", ok: true, detail: ".cursor/ exists" });
  } catch {
    checks.push({ label: "Cursor integration", ok: false, detail: "Not initialized; run cdk-kit init" });
  }
  const manifest = await readManifest(root);
  checks.push({ label: "CDK manifest", ok: Boolean(manifest), detail: manifest ? `engine ${manifest.engineVersion}, ${Object.keys(manifest.files).length} managed files` : "Not installed" });
  checks.push({ label: "Project profile", ok: true, detail: project.profiles.join(", ") || "general" });
  stdout.write(`CDK Doctor — CLI ${ENGINE_VERSION}\n\n`);
  for (const check of checks) stdout.write(`[${check.ok ? "PASS" : "WARN"}] ${check.label}: ${check.detail}\n`);
  if (checks.some(check => !check.ok)) process.exitCode = 1;
}
