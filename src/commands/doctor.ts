import { access, readdir } from "node:fs/promises";
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
  checks.push({ label: "Project profile detection", ok: true, detail: project.profiles.join(", ") || "no profile matched; general guidance applies" });
  try {
    const files = (await readdir(path.join(root, ".cdk", "profiles"))).filter(file => file.endsWith(".md"));
    checks.push({ label: "Technology profiles", ok: files.length >= 6, detail: `${files.length} of 6 installed` });
  } catch {
    checks.push({ label: "Technology profiles", ok: false, detail: "Not installed; run cdk-kit init" });
  }
  try {
    const files = (await readdir(path.join(root, ".cdk", "quality-gates"))).filter(file => file.endsWith(".md"));
    checks.push({ label: "Quality gates", ok: files.length >= 8, detail: `${files.length} of 8 installed` });
  } catch {
    checks.push({ label: "Quality gates", ok: false, detail: "Not installed; run cdk-kit init" });
  }
  stdout.write(`CDK Doctor — CLI ${ENGINE_VERSION}\n\n`);
  for (const check of checks) stdout.write(`[${check.ok ? "PASS" : "WARN"}] ${check.label}: ${check.detail}\n`);
  if (checks.some(check => !check.ok)) process.exitCode = 1;
}
