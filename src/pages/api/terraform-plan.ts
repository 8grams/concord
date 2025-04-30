import { spawn } from "node:child_process";
import type { APIRoute } from "astro";
import { Db, Proposal, Workspace } from "../../db";
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
        ? ` ${exportCommands} && ${exportSecrets} && terraform init && terraform plan`
        : 'terraform init && terraform plan';

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
        // Save output to database
        await Db.getRepository(Proposal).update(proposalId, {
          lastPlanOutput: output,
          lastPlanExecutor: userId
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