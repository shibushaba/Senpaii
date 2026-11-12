import { readFile, mkdir, writeFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
export const ENGINE_NAME = "cdk-kit";
export const ENGINE_VERSION = "0.3.2";
export const MANIFEST_RELATIVE_PATH = path.join(".cdk", "cli-manifest.json");
export function projectIdentity(projectRoot) {
    const name = path.basename(path.resolve(projectRoot)) || "project";
    const id = name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
    return { id, name };
}
export async function readManifest(projectRoot) {
    const manifestPath = path.join(projectRoot, MANIFEST_RELATIVE_PATH);
    try {
        const raw = await readFile(manifestPath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed.schemaVersion !== 1 || parsed.engine !== ENGINE_NAME || !parsed.files || typeof parsed.files !== "object") {
            throw new Error("Unsupported or invalid CDK manifest.");
        }
        return parsed;
    }
    catch (error) {
        if (error.code === "ENOENT")
            return null;
        throw error;
    }
}
export async function writeManifest(projectRoot, manifest) {
    const manifestPath = path.join(projectRoot, MANIFEST_RELATIVE_PATH);
    await mkdir(path.dirname(manifestPath), { recursive: true });
    const temporaryPath = `${manifestPath}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    try {
        await rename(temporaryPath, manifestPath);
    }
    catch (error) {
        await unlink(temporaryPath).catch(() => undefined);
        throw error;
    }
}
//# sourceMappingURL=manifest.js.map