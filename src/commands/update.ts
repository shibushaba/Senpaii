import { runInit } from "./init.js";

export async function runUpdate(target = ".", options: { yes?: boolean; dryRun?: boolean } = {}): Promise<void> {
  await runInit(target, options);
}
