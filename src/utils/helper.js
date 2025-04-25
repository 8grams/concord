// from git@gitlab.impstudio.id:devops/csp-pintar.git to https://gitlab.impstudio.id/devops/csp-pintar
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