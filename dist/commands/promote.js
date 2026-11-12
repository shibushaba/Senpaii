import { stdout } from "node:process";
import { promoteLesson } from "../lib/knowledge.js";
export async function runPromote(lesson, options = {}) {
    const result = await promoteLesson({
        lessonPath: lesson,
        yes: options.yes === true,
        dryRun: options.dryRun === true,
        allowDuplicate: options.allowDuplicate === true
    });
    stdout.write(result.message);
}
//# sourceMappingURL=promote.js.map