Preserve a procedure that actually worked, including the conditions that made it safe.

1. Confirm the procedure succeeded. Use the command output, the test result, or the user's confirmation. Do not document a workflow you only planned.
2. Write down preconditions: branch state, services, environment, and permissions. Leave out secrets.
3. Record the steps in the order that worked, with the checks between them. Note steps that are destructive and require approval.
4. Record when not to use the procedure.
5. Create `.cdk/workflows/WFL-YYYYMMDD-NNN.md` from `.cdk/templates/workflow.md`.
6. If the workflow overturns an earlier habit, add a proposed lesson that points at this workflow and at the experience that showed the old habit failing.
7. Search existing workflows first and update an existing record only when the user agrees; otherwise create a new id and link the older one.
8. Do not mark the workflow as globally approved. Promotion stays a separate, explicit step.
