import { access, readFile } from "node:fs/promises";
import path from "node:path";

export interface ProjectInfo {
  root: string;
  name: string;
  id: string;
  markers: string[];
  profiles: string[];
}

async function exists(filePath: string): Promise<boolean> {
  try { await access(filePath); return true; } catch { return false; }
}

export async function detectProject(projectRoot: string): Promise<ProjectInfo> {
  const root = path.resolve(projectRoot);
  const name = path.basename(root);
  const id = name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  const markers: string[] = [];
  const profiles = new Set<string>();

  if (await exists(path.join(root, "package.json"))) {
    markers.push("package.json");
    try {
      const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.react || deps.vite) profiles.add("react-typescript");
      if (deps.next) profiles.add("nextjs");
      if (deps["@nestjs/core"]) profiles.add("nestjs");
    } catch { markers.push("package.json (unreadable)"); }
  }
  if (await exists(path.join(root, "pyproject.toml"))) { markers.push("pyproject.toml"); profiles.add("python"); }
  if (await exists(path.join(root, "requirements.txt"))) { markers.push("requirements.txt"); profiles.add("python"); }
  if (await exists(path.join(root, "manage.py"))) profiles.add("django");
  if (await exists(path.join(root, "pubspec.yaml"))) { markers.push("pubspec.yaml"); profiles.add("flutter-dart"); }
  if (await exists(path.join(root, "deno.json")) || await exists(path.join(root, "deno.jsonc"))) {
    markers.push("deno.json"); profiles.add("deno");
  }
  if (await exists(path.join(root, "go.mod"))) { markers.push("go.mod"); profiles.add("go"); }
  if (await exists(path.join(root, "Cargo.toml"))) { markers.push("Cargo.toml"); profiles.add("rust"); }
  if (await exists(path.join(root, ".cursor"))) markers.push(".cursor/ (existing IDE configuration)");
  return { root, name, id, markers, profiles: [...profiles].sort() };
}
