import { Db, Workspace } from "../db";
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

export async function generateEnvVars(workspaceId) {
  const workspace = await Db.getRepository(Workspace).findOne({ where: { id: workspaceId } });
  const envVars = workspace?.envVars;

  let exportCommands = Object.entries(envVars || {})
  .map(([idx, val]) => `export ${val['key']}=${decrypt(val['value'])}`)
        .join(' && ');

  if (exportCommands.length > 0) {
    exportCommands = `${exportCommands} &&`;
  }

  return exportCommands;
}

export async function generateSecrets(workspaceId) {
  const workspace = await Db.getRepository(Workspace).findOne({ where: { id: workspaceId } });
  const secrets = workspace?.secrets;
  
  let exportSecrets = Object.entries(secrets || {})
  .map(([idx, val]) => `export TF_VAR_${val['key']}=${decrypt(val['value'])}`)
        .join(' && ');

  if (exportSecrets.length > 0) {
    exportSecrets = `${exportSecrets} &&`;
  }

  return exportSecrets;
}

