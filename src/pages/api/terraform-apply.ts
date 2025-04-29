import { spawn } from "node:child_process";
import type { APIRoute } from "astro";
import { Db, Proposal } from "../../db";

export const POST: APIRoute = async ({ request }) => {
  const { workspaceId, mainDirectory, proposalId } = await request.json();

  const terraformProcess = spawn("terraform", ["apply", "-auto-approve"], {
    cwd: `data/repositories/${workspaceId}/${mainDirectory}`
  });

  const stream = new ReadableStream({
    start(controller) {
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