import { Db, Proposal, User, Workspace } from "../db";
import { env } from "./env";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";

/**
 * Send an email using the configured SMTP transport
 * @param {string|string[]} to - Recipient email address(es)
 * @param {Object} data - Email data
 * @param {string} data.subject - Email subject
 * @param {string} data.template - Handlebars template name
 * @param {Object} data.context - Template context data
 */
export async function sendEmail(to, data) {
  const smtp = env.SMTP_DSN;
  const transporter = nodemailer.createTransport(smtp);
  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extname: ".hbs",
        layoutsDir: "src/pages/emails/layouts",
        partialsDir: "src/pages/emails/partials",
      },
      viewPath: "src/pages/emails",
      extName: ".hbs",
    }),
  );

  await transporter.sendMail({
    to,
    ...data,
  });
}

/**
 * Get a proposal from the database
 * @param {number} proposalId - ID of the proposal
 * @returns {Promise<Proposal>} Proposal object
 */
async function getProposal(proposalId) {
  const proposal = await Db.getRepository(Proposal).findOne({
    where: {
      id: proposalId,
    },
    relations: {
      lastPlanExecutor: true,
      applyExecutor: true,
      createdBy: true,
      rejector: true,
    },
  });
  return proposal;
}

/**
 * Get all maintainers from the database
 * @returns {Promise<Array>} Array of maintainer objects
 */
async function getMaintainers() {
  const maintainers = await Db.getRepository(User).find({
    where: {
      role: "maintainer",
    },
  });
  return maintainers;
}

/**
 * Send email notification for a new proposal
 * @param {number} proposalId - ID of the new proposal
 * @throws {Error} If proposal is not found
 */
export async function sendNewProposalEmail(proposalId) {
  const proposal = await getProposal(proposalId);
  const workspace = await Db.getRepository(Workspace).findOne({
    where: {
      id: proposal.workspace,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }

  const maintainers = await getMaintainers();
  sendEmail(
    maintainers.map((item) => item.email),
    {
      template: "new_proposal",
      subject: "New Proposal",
      context: {
        title: "New Proposal",
        body: `New Proposal on ${workspace.name} from ${proposal.createdBy.name}`
      },
    },
  );
}

/**
 * Send email notification for a rejected proposal
 * @param {number} proposalId - ID of the rejected proposal
 * @throws {Error} If proposal is not found
 */
export async function sendProposalRejectedEmail(proposalId) {
  const proposal = await getProposal(proposalId);

  const workspace = await Db.getRepository(Workspace).findOne({
    where: {
      id: proposal.workspace,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }
  
  sendEmail(
    proposal.createdBy.email,
    {
      template: "reject_proposal",
      subject: "Your Proposal has been rejected",
      context: {
        title: "Your Proposal has been rejected",
        body: `Your Proposal ${proposal.sourceBranch} on ${workspace.name} has been rejected by ${proposal.rejector.name}`,
      },
    },
  );
}

/**
 * Send email notification for an applied proposal
 * @param {number} proposalId - ID of the applied proposal
 * @throws {Error} If proposal is not found
 */
export async function sendProposalAppliedEmail(proposalId) {
  const proposal = await getProposal(proposalId);

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }
  const workspace = await Db.getRepository(Workspace).findOne({
    where: {
      id: proposal.workspace,
    },
  });

  sendEmail(
    proposal.createdBy.email,
    {
      template: "proposal_applied",
      subject: "Your Proposal has been approved",
      context: {
        title: "Your Proposal has been approved",
        body: `Your Proposal ${proposal.sourceBranch} on ${workspace.name} has been approved by ${proposal.applyExecutor.name}`,
      },
    },
  );
}

/**
 * Send email notification for an apply request
 * @param {number} proposalId - ID of the proposal with apply request
 * @throws {Error} If proposal is not found
 */
export async function sendApplyRequestEmail(proposalId) {
  const proposal = await Db.getRepository(Proposal).findOne({
    where: {
      id: proposalId,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }

  const workspace = await Db.getRepository(Workspace).findOne({
    where: {
      id: proposal.workspace,
    },
  });

  const maintainers = await getMaintainers();

  sendEmail(
    maintainers.map((item) => item.email),
    {
      template: "apply_request",
      subject: "Apply Request",
      context: {
        title: "Apply Request",
        body: `${proposal.createdBy.name} has requested to apply ${proposal.sourceBranch} on ${workspace.name}`,
      },
    },
  );
}

