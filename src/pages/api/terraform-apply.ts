import { spawn } from "node:child_process";
import type { APIRoute } from "astro";
import { Db, Proposal, Workspace } from "../../db";
import { decrypt } from "../../utils/crypto";

export const POST: APIRoute = async ({ request }) => {
  const { workspaceId, mainDirectory, proposalId } = await request.json();
  const workspace = await Db.getRepository(Workspace).findOne({ where: { id: workspaceId } });
  const envVars = workspace?.envVars;

  const stream = new ReadableStream({
    start(controller) {
      // Prepare environment variables as export commands
      const exportCommands = Object.entries(envVars || {})
        .map(([idx, val]) => `export ${val['key']}=${decrypt(val['value'])}`)
        .join(' && ');

      // Construct the full command
      const fullCommand = exportCommands 
        ? `${exportCommands} && terraform apply -auto-approve`
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
          lastPlanOutput: output
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