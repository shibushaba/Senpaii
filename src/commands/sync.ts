import { stdout } from "node:process";
import path from "node:path";
import { syncKnowledge } from "../lib/knowledge.js";

export async function runSync(target = ".", options: { dryRun?: boolean } = {}): Promise<void> {
  const result = await syncKnowledge({ projectRoot: path.resolve(target), dryRun: options.dryRun === true });
  stdout.write(result.message);
}
