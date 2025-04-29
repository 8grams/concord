import { spawn } from "node:child_process";
import type { APIRoute } from "astro";
import { Db, ProposalPlan } from "../../db";

export const POST: APIRoute = async ({ request }) => {
  const { workspaceId, mainDirectory, proposalId } = await request.json();

  // Create a new plan record
  const plan = await Db.getRepository(ProposalPlan).save({
    proposal: proposalId,
    status: "Running",
    output: "",
  });

  const terraformProcess = spawn("terraform", ["init"], {
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
        await Db.getRepository(ProposalPlan).update(plan.id, {
          output,
          status: "Finished"
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