import { spawn } from "node:child_process";
import type { APIRoute } from "astro";
import { Db, Proposal, Workspace } from "../../db";
import { decrypt } from "../../utils/crypto";
import fs from "fs";
import path from "path";

export const POST: APIRoute = async ({ request }) => {
  const { workspaceId, mainDirectory, proposalId, userId } =
    await request.json();
  const workspace = await Db.getRepository(Workspace).findOne({
    where: { id: workspaceId },
  });
  const envVars = workspace?.envVars;
  const outputDirectory = workspace?.outputDirectory || "output";

  // Create output directory if it doesn't exist
  const outputPath = `data/repositories/${workspaceId}/${outputDirectory}`;
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Generate a unique filename for the output
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFileName = `terraform-plan-${timestamp}.txt`;
  const outputFilePath = path.join(outputPath, outputFileName);

  const stream = new ReadableStream({
    start(controller) {
      // Prepare environment variables as export commands
      const exportCommands = Object.entries(envVars || {})
        .map(([idx, val]) => `export ${val["key"]}=${decrypt(val["value"])}`)
        .join(" && ");
      // Construct the full command
      const fullCommand = exportCommands
        ? `${exportCommands} && terraform init && terraform plan`
        : "terraform init && terraform plan";
      // Run both commands in sequence using shell
      const terraformProcess = spawn("sh", ["-c", fullCommand], {
        cwd: `data/repositories/${workspaceId}/${mainDirectory}`,
      });

      // Create write stream for the output file
      const fileStream = fs.createWriteStream(outputFilePath);
      let output = "";

      terraformProcess.stdout.on("data", (data) => {
        const text = data.toString();
        output += text;
        controller.enqueue(text);
        fileStream.write(text); // Write to file
      });

      terraformProcess.stderr.on("data", (data) => {
        const text = `Error: ${data.toString()}`;
        output += text;
        controller.enqueue(text);
        fileStream.write(text); // Write errors to file too
      });

      terraformProcess.on("close", async (code) => {
        // Add execution result to the output file
        const resultText = `\n\n====================================\nExecution completed with code: ${code}\nTimestamp: ${new Date().toISOString()}\nExecuted by: User ID ${userId}\n====================================`;
        fileStream.write(resultText);
        fileStream.end();

        // Save output to database
        await Db.getRepository(Proposal).update(proposalId, {
          lastPlanOutput: output,
          lastPlanExecutor: userId,
        });

        controller.close();
      });

      // Handle file stream errors
      fileStream.on("error", (err) => {
        console.error("Error writing to output file:", err);
        controller.enqueue(`Error saving output: ${err.message}\n`);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
