import { spawn } from "node:child_process";
import type { APIRoute } from "astro";
import { Db, Proposal } from "../../db";
import { generateEnvVars, generateSecrets } from "../../utils/helper";

export const POST: APIRoute = async ({ request }) => {
  const { workspaceId, mainDirectory, proposalId, userId } = await request.json();

  const stream = new ReadableStream({
    start(controller) {
      // Prepare environment variables as export commands
      const exportCommands = generateEnvVars(workspaceId);  
      const exportSecrets = generateSecrets(workspaceId);

      // Construct the full command
      const fullCommand = exportCommands 
        ? ` ${exportCommands} && ${exportSecrets} && terraform apply -auto-approve`
        : 'terraform apply -auto-approve';

      // Run both commands in sequence using shell
      const terraformProcess = spawn("sh", ["-c", fullCommand], {
        cwd: `data/repositories/${workspaceId}/${mainDirectory}`
      });

      let output = "";

      terraformProcess.stdout.on("data", (data) => {
        const text = data.toString();
        output += text;
        controller.enqueue(text);
      });

      terraformProcess.stderr.on("data", (data) => {
        const text = `Error: ${data.toString()}`;
        output += text;
        controller.enqueue(text);
      });

      terraformProcess.on("close", async () => {
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