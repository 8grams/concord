import { Workspace } from "../db";
import { decrypt } from "./crypto";

export function getCommitURL(gitURL, hash) {
  const regex = /^git@([^:]+):(.+)\.git$/;
  const match = gitURL.match(regex);

  if (!match) {
    throw new Error("Invalid SSH Git URL format.");
  }

  const [, host, path] = match;
  return `https://${host}/${path}/-/commit/${hash}`;
}

export function getBranchURL(gitURL, branch) {
  const regex = /^git@([^:]+):(.+)\.git$/;
  const match = gitURL.match(regex);

  if (!match) {
    throw new Error("Invalid SSH Git URL format.");
  }

  const [, host, path] = match;
  return `https://${host}/${path}/-/tree/${branch}`;
}

export function generateEnvVars(workspaceId) {
  const workspace = Db.getRepository(Workspace).findOne({ where: { id: workspaceId } });
  const envVars = workspace?.envVars;
  
  const exportCommands = Object.entries(envVars || {})
  .map(([idx, val]) => `export ${val['key']}=${decrypt(val['value'])}`)
        .join(' && ');

  return exportCommands;
}

export function generateSecrets(workspaceId) {
  const workspace = Db.getRepository(Workspace).findOne({ where: { id: workspaceId } });
  const secrets = workspace?.secrets;
  
  const exportSecrets = Object.entries(secrets || {})
  .map(([idx, val]) => `export ${val['key']}=${decrypt(val['value'])}`)
        .join(' && ');

  return exportSecrets;
}

