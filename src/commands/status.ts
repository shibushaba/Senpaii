import path from "node:path";
import { stdout } from "node:process";
import { ENGINE_VERSION, readManifest } from "../lib/manifest.js";
import { detectProject } from "../lib/project.js";

export async function runStatus(target = "."): Promise<void> {
  const root = path.resolve(target);
  const project = await detectProject(root);
  const manifest = await readManifest(root);
  stdout.write(`CDK CLI: ${ENGINE_VERSION}\nProject: ${project.name}\nPath: ${root}\nProfiles: ${project.profiles.join(", ") || "general"}\n`);
  if (!manifest) { stdout.write("Status: not initialized (run cdk-kit init)\n"); return; }
  stdout.write(`Status: initialized\nInstalled engine: ${manifest.engineVersion}\nManaged files: ${Object.keys(manifest.files).length}\nLast updated: ${manifest.updatedAt}\nProject memory: isolated in this repository\n`);
}
