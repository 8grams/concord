/**
 * Database and workspace models
 */
import { Db, Workspace } from "../db";
/**
 * Decryption utility
 */
import { decrypt } from "./crypto";

/**
 * Generates a URL to a specific commit in a Git repository
 * @param {string} gitURL - SSH Git URL in format git@host:path.git
 * @param {string} hash - Git commit hash
 * @returns {string} URL to the commit on the hosting platform
 * @throws {Error} If the Git URL format is invalid
 */
export function getCommitURL(gitURL, hash) {
  const regex = /^git@([^:]+):(.+)\.git$/;
  const match = gitURL.match(regex);

  if (!match) {
    throw new Error("Invalid SSH Git URL format.");
  }

  const [, host, path] = match;
  return `https://${host}/${path}/-/commit/${hash}`;
}

/**
 * Generates a URL to a specific branch in a Git repository
 * @param {string} gitURL - SSH Git URL in format git@host:path.git
 * @param {string} branch - Git branch name
 * @returns {string} URL to the branch on the hosting platform
 * @throws {Error} If the Git URL format is invalid
 */
export function getBranchURL(gitURL, branch) {
  const regex = /^git@([^:]+):(.+)\.git$/;
  const match = gitURL.match(regex);

  if (!match) {
    throw new Error("Invalid SSH Git URL format.");
  }

  const [, host, path] = match;
  return `https://${host}/${path}/-/tree/${branch}`;
}

/**
 * Generates environment variable export commands for a workspace
 * @param {string|number} workspaceId - ID of the workspace
 * @returns {Promise<string>} Shell commands to export environment variables, concatenated with &&
 */
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

/**
 * Generates Terraform secret export commands for a workspace
 * @param {string|number} workspaceId - ID of the workspace
 * @returns {Promise<string>} Shell commands to export secrets as TF_VAR environment variables, concatenated with &&
 */
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

