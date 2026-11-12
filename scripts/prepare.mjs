import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const compiler = ["node_modules/typescript/lib/tsc.js", "node_modules/typescript/bin/tsc"]
  .find(file => existsSync(file));

if (!compiler) {
  if (!existsSync("dist/cli.js")) {
    console.error("cdk-kit: dist/cli.js is missing and TypeScript is not installed.");
    process.exit(1);
  }
  console.log("cdk-kit: TypeScript is not installed; using the prebuilt dist/.");
  process.exit(0);
}

const result = spawnSync(process.execPath, [compiler, "-p", "tsconfig.json"], { stdio: "inherit" });
process.exit(result.status === null ? 1 : result.status);
