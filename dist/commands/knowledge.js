import { stdout } from "node:process";
import path from "node:path";
import { readProjectConfig } from "../lib/config.js";
import { searchKnowledge } from "../lib/knowledge.js";
export async function runKnowledge(target = ".", options = {}) {
    const root = path.resolve(target);
    const parsedLimit = options.limit === undefined ? 20 : Number(options.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        throw new Error("Limit must be an integer from 1 to 100.");
    }
    const config = await readProjectConfig(root);
    const includeGlobal = options.global === true || config.globalEnabled;
    const hits = await searchKnowledge({
        projectRoot: root,
        query: options.query,
        includeGlobal,
        limit: parsedLimit
    });
    stdout.write(`CDK knowledge — ${path.basename(root)}\n`);
    stdout.write(`Query: ${options.query?.trim() || "(everything)"}\n`);
    stdout.write(`Global library: ${includeGlobal ? "included" : "off (pass --global or enable it in .cdk/config.yaml)"}\n\n`);
    if (hits.length === 0) {
        stdout.write("No matching CDK knowledge.\n");
        return;
    }
    for (const hit of hits) {
        stdout.write(`[${hit.scope}] [${hit.status}] ${hit.id} — ${hit.title}\n`);
        stdout.write(`  ${hit.relativePath}\n`);
        if (hit.summary)
            stdout.write(`  ${hit.summary}\n`);
    }
    stdout.write("\nVerified and approved records outrank proposed ones. Proposed records are advisory. Nothing here overrides the repository.\n");
}
//# sourceMappingURL=knowledge.js.map