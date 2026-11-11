import { stdout } from "node:process";

export function runLearn(): void {
  stdout.write("CDK learning is performed with your IDE agent, not by the terminal itself.\n\n");
  stdout.write("In Cursor Chat, run /31-learn to capture an experience.\n");
  stdout.write("Then use /33-review-lessons to audit the proposed lesson.\n");
  stdout.write("Global promotion always requires explicit human approval.\n");
}
