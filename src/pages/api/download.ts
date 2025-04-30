// File: /src/pages/api/download.js (or download.ts if using TypeScript)
import { Db, Workspace } from "../../db";
import fs from "fs";
import path from "path";

export async function GET({ request }) {
  try {
    // Parse the request URL to get query parameters
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspace");
    const fileName = url.searchParams.get("file");
    const outputDir = url.searchParams.get("dir");

    // Input validation
    if (!workspaceId || !fileName || !outputDir) {
      return new Response("Missing required parameters", { status: 400 });
    }

    // Security check to prevent directory traversal attacks
    if (fileName.includes("..") || outputDir.includes("..")) {
      return new Response("Invalid file path", { status: 403 });
    }

    // Verify workspace exists and user has access
    const workspace = await Db.getRepository(Workspace).findOneBy({
      id: parseInt(workspaceId),
    });

    if (!workspace) {
      return new Response("Workspace not found", { status: 404 });
    }

    // Construct the file path
    const filePath = path.join(
      process.cwd(),
      "data",
      "repositories",
      workspaceId,
      outputDir,
      fileName,
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new Response("File not found", { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type based on file extension
    const ext = path.extname(fileName).toLowerCase();
    let contentType = "application/octet-stream"; // Default content type

    // Map common extensions to MIME types
    const mimeTypes = {
      ".txt": "text/plain",
      ".pdf": "application/pdf",
      ".json": "application/json",
      ".csv": "text/csv",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
    };

    if (mimeTypes[ext]) {
      contentType = mimeTypes[ext];
    }

    // Create and return response with appropriate headers
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response("Server error", { status: 500 });
  }
}
