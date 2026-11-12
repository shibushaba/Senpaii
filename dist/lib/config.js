import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeNewlines } from "./text.js";
export async function readProjectConfig(projectRoot) {
    const filePath = path.join(projectRoot, ".cdk", "config.yaml");
    let text = "";
    try {
        text = normalizeNewlines(await readFile(filePath, "utf8"));
    }
    catch (error) {
        if (error.code === "ENOENT")
            return { globalEnabled: false, globalPath: null };
        throw error;
    }
    const match = text.match(/^global_knowledge:\n((?:  .*\n?)*)/m);
    const block = match?.[1] ?? "";
    const enabled = /^  enabled:\s*true\s*$/m.test(block);
    const pathMatch = block.match(/^  path:\s*(.+)\s*$/m);
    let globalPath = null;
    if (pathMatch?.[1]) {
        const raw = pathMatch[1].trim().replace(/^["']|["']$/g, "");
        if (raw && raw !== "null" && raw !== "~")
            globalPath = raw;
    }
    return { globalEnabled: enabled, globalPath };
}
//# sourceMappingURL=config.js.map