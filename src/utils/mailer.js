import { env } from "./env";

export async function sendEmail(to, data) {
  const smtp = env.SMTP_DSN;
}

export async function sendNewProposalEmail(proposalId) {

}

export async function sendProposalRejectedEmail (proposalId) {

}

export async function sendProposalAppliedEmail(proposalId) {

}

export async function sendApplyRequestEmail(proposalId) {

}

export async function sendApplyFinishedEmail(proposalId) {

}

export async function sendApplyFailedEmail(proposalId) {

}


