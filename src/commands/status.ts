import { readdir } from "node:fs/promises";
import path from "node:path";
import { stdout } from "node:process";
import { ENGINE_VERSION, readManifest } from "../lib/manifest.js";
import { detectProject } from "../lib/project.js";
import { readProjectConfig } from "../lib/config.js";

async function countMarkdown(directory: string): Promise<number> {
  try { return (await readdir(directory)).filter(file => file.endsWith(".md")).length; }
  catch { return 0; }
}

export async function runStatus(target = "."): Promise<void> {
  const root = path.resolve(target);
  const project = await detectProject(root);
  const manifest = await readManifest(root);
  const [profileCount, qualityGateCount] = await Promise.all([
    countMarkdown(path.join(root, ".cdk", "profiles")),
    countMarkdown(path.join(root, ".cdk", "quality-gates"))
  ]);
  const activeGates = project.gates.filter(gate => gate.status === "active").map(gate => gate.id);
  const config = await readProjectConfig(root);
  stdout.write(`CDK CLI: ${ENGINE_VERSION}\nProject: ${project.name}\nPath: ${root}\nDetected profile matches: ${project.profiles.join(", ") || "none (general guidance)"}\n`);
  stdout.write(`Active quality gates: ${activeGates.join(", ")}\nGlobal knowledge: ${config.globalEnabled ? "enabled" : "disabled"}\n`);
  if (!manifest) { stdout.write("Status: not initialized (run cdk-kit init)\n"); return; }
  stdout.write(`Status: initialized\nInstalled engine: ${manifest.engineVersion}\nManaged files: ${Object.keys(manifest.files).length}\nTechnology profiles: ${profileCount}/6\nQuality gates: ${qualityGateCount}/8\nLast updated: ${manifest.updatedAt}\nProject memory: isolated in this repository\n`);
}
