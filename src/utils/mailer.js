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
export async function sendEmail(to, subject, data) {
  if (env.SMTP_HOST === "" 
    || env.SMTP_PORT === "" 
    || env.SMTP_USER === "" 
    || env.SMTP_PASSWORD === "") { 
    return;
  }

  const from = env.SMTP_FROM_ADDRESS;
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT, 587),
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
    }
  });

  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extname: ".hbs",
        layoutsDir: `${env.EMAIL_TEMPLATES_PATH}/layouts`,
        partialsDir: `${env.EMAIL_TEMPLATES_PATH}/partials`,
      },
      viewPath: `${env.EMAIL_TEMPLATES_PATH}`,
      extName: ".hbs",
    }),
  );

  await transporter.sendMail({
    to,
    from,
    subject,
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

export async function sendNewUserEmail(userId) {
  const user = await Db.getRepository(User).findOne({
    where: {
      id: userId,
    },
  });

  await sendEmail(
    user.email,
    {
      template: "_new_user",
      subject: "Welcome to Concord",
      context: {
        title: "Welcome to Concord",
        body: `You have been added to Concord as a ${user.role}`,
      },
    },
  );
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
  await sendEmail(
    maintainers.map((item) => item.email),
    "New Proposal",
    {
      template: "_new_proposal",
      context: {
        title: "New proposal",
        body: `New proposal on ${workspace.name} has been created by ${proposal.createdBy.name}`
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
  
  await sendEmail(
    proposal.createdBy.email,
    "Your proposal has been rejected",
    {
      template: "_reject_proposal",
      context: {
        title: "Your proposal has been rejected",
        body: `Your proposal ${proposal.branch} on ${workspace.name} has been rejected by ${proposal.rejector.name}`,
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

  await sendEmail(
    proposal.createdBy.email,
    "Your proposal has been approved",
    {
      template: "_proposal_applied",
      context: {
        title: "Your proposal has been approved",
        body: `Your proposal ${proposal.branch} on ${workspace.name} has been approved by ${proposal.applyExecutor.name}`,
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

  await sendEmail(
    maintainers.map((item) => item.email),
    "Apply Request",
    {
      template: "_apply_request",
      context: {
        title: "Apply Request",
        body: `${proposal.createdBy.name} has requested to apply ${proposal.sourceBranch} on ${workspace.name}`,
      },
    },
  );
}

