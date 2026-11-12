import { stdout } from "node:process";
import path from "node:path";
import { retractLesson } from "../lib/knowledge.js";

export async function runRetract(id: string, target = ".", options: { yes?: boolean; dryRun?: boolean } = {}): Promise<void> {
  stdout.write(await retractLesson(id, {
    projectRoot: path.resolve(target),
    yes: options.yes === true,
    dryRun: options.dryRun === true
  }));
}
