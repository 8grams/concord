import { spawn } from "node:child_process";
import type { APIRoute } from "astro";
import { Db, Proposal } from "../../db";
import { generateEnvVars, generateSecrets } from "../../utils/helper";

export const POST: APIRoute = async ({ request }) => {
  const { workspaceId, mainDirectory, proposalId, planEnvironment, userId } = await request.json();

  // Prepare environment variables as export commands
  const exportCommands = await generateEnvVars(workspaceId);  
  const exportSecrets = await generateSecrets(workspaceId);

  const stream = new ReadableStream({
    start(controller) {

      // Construct the full command
      const fullCommand = exportCommands 
        ? ` ${exportCommands} ${exportSecrets} tanka apply ${planEnvironment} --auto-approve=always`
        : `tanka apply ${planEnvironment} --auto-approve=always`;

      // Run both commands in sequence using shell
      const tankaProcess = spawn("sh", ["-c", fullCommand], {
        cwd: `data/repositories/${workspaceId}/${mainDirectory}`
      });

      let output = "";

      tankaProcess.stdout.on("data", (data) => {
        const text = data.toString();
        output += text;
        controller.enqueue(text);
      });

      tankaProcess.stderr.on("data", (data) => {
        const text = `Error: ${data.toString()}`;
        output += text;
        controller.enqueue(text);
      });

      tankaProcess.on("close", async () => {
        // Update the plan record with the final output
        await Db.getRepository(Proposal).update(proposalId, {
          lastPlanOutput: output,
          status: "Applied",
          applyExecutor: userId
        });
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}; 