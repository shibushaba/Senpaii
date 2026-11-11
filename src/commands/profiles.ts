import { readdir } from "node:fs/promises";
import path from "node:path";
import { stdout } from "node:process";
import { PROFILE_CATALOG, detectProject } from "../lib/project.js";

export async function runProfiles(target = "."): Promise<void> {
  const root = path.resolve(target);
  const project = await detectProject(root);
  const directory = path.join(root, ".cdk", "profiles");
  let installed = new Set<string>();
  try {
    installed = new Set(await readdir(directory));
  } catch {
    stdout.write("CDK technology profiles are not installed in this project. Run cdk-kit init first.\n");
    return;
  }

  stdout.write(`CDK technology profiles — ${project.name}\n`);
  stdout.write(`Project evidence: ${project.markers.join(", ") || "no recognized markers"}\n\n`);
  for (const profile of PROFILE_CATALOG) {
    const present = installed.has(profile.file);
    const matched = project.profiles.includes(profile.id);
    const status = !present ? "MISSING" : matched ? "MATCHED" : "AVAILABLE (not matched)";
    stdout.write(`[${status}] ${profile.label} — .cdk/profiles/${profile.file}\n`);
  }
  stdout.write("\nProfiles are advisory. Read only matched profiles, and verify the relevant framework/database from source before applying guidance.\n");
}
