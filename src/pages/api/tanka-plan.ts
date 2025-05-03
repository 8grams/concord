import { spawn } from "node:child_process";
import type { APIRoute } from "astro";
import { Db, Proposal, Workspace } from "../../db";
import { generateEnvVars, generateSecrets } from "../../utils/helper";
import { chmodSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { decrypt } from "../../utils/crypto";
export const POST: APIRoute = async ({ request }) => {
  const { workspaceId, mainDirectory, proposalId, environment, userId } = await request.json();

  const workspace = await Db.getRepository(Workspace).findOne({ where: { id: workspaceId } });
  const kubeconfig = decrypt(workspace.kubeconfig);

  const tempKubeconfigPath = join(tmpdir(), `kubeconfig-${Date.now()}`);
  writeFileSync(tempKubeconfigPath, kubeconfig);
  chmodSync(tempKubeconfigPath, 0o600);

  // Prepare environment variables as export commands
  const exportCommands = await generateEnvVars(workspaceId);  
  const exportSecrets = await generateSecrets(workspaceId);

  const stream = new ReadableStream({
    start(controller) {

      // Construct the full command
      const fullCommand = exportCommands 
        ? ` jb install && KUBECONFIG=${tempKubeconfigPath} ${exportCommands} ${exportSecrets} tk diff environments/${environment} --color=always`
        : ` jb install && KUBECONFIG=${tempKubeconfigPath} tk diff environments/${environment} --color=always`;

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
          lastPlanExecutor: userId
        });
        controller.close();
        unlinkSync(tempKubeconfigPath);
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}; 