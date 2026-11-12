import { stdout } from "node:process";
import path from "node:path";
import { retractLesson } from "../lib/knowledge.js";
export async function runRetract(id, target = ".", options = {}) {
    stdout.write(await retractLesson(id, {
        projectRoot: path.resolve(target),
        yes: options.yes === true,
        dryRun: options.dryRun === true
    }));
}
//# sourceMappingURL=retract.js.map