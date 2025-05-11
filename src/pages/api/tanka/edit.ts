import type { APIRoute } from "astro";
import { execSync } from "child_process";
import { chmodSync, writeFileSync } from "fs";
import { Db } from "../../../db";
import { Workspace } from "../../../db";
import { decrypt } from "../../../utils/crypto";
import { tmpdir } from "os";
import { join } from "path";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { workspaceId, mainDirectory, environment, content } = await request.json();
    const filePath = `data/repositories/${workspaceId}/${mainDirectory}/environments/${environment}/main.jsonnet`;
    
    const workspace = await Db.getRepository(Workspace).findOneBy({
      id: workspaceId,
    });

    const tempKeyPath = join(tmpdir(), `tempkey-${Date.now()}`);
    writeFileSync(tempKeyPath, decrypt(workspace?.privateKey));
    chmodSync(tempKeyPath, 0o600);
    
    // commit git
    // sync git
    execSync(`
      cd data/repositories/${workspaceId} && \
      git config --global pull.rebase false && \
      git config --global user.email "${locals.user.email}" && \
      git config --global user.name "${locals.user.name}" && \
      GIT_SSH_COMMAND="ssh -i ${tempKeyPath} -o IdentitiesOnly=yes -o StrictHostKeyChecking=no" \
      git pull origin ${workspace?.mainBranch}
    `);
    writeFileSync(filePath, content, 'utf-8');

    console.log(locals.user.email);
    console.log(locals.user.name);

    // update git
    execSync(`
      cd data/repositories/${workspaceId} &&
      git config --global user.email "${locals.user.email}" && \
      git config --global user.name "${locals.user.name}" && \
      git add . && \
      git commit -m "Update main jsonnet" && \
      GIT_SSH_COMMAND="ssh -i ${tempKeyPath} -o IdentitiesOnly=yes -o StrictHostKeyChecking=no" git push origin ${workspace?.mainBranch}
    `);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return new Response(JSON.stringify({ error: 'Failed to save file' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 