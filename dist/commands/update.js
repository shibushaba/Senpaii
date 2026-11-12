import { runInit } from "./init.js";
export async function runUpdate(target = ".", options = {}) {
    await runInit(target, options);
}
//# sourceMappingURL=update.js.map