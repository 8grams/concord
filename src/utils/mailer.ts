import { Db, Proposal, User } from "../db";
import { env } from "./env";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";

interface Data {
  subject: string;
  template: string;
  context: object;
}

export async function sendEmail(to: string[] | string, data: Data) {
  const smtp = env.SMTP_DSN;
  const transporter = nodemailer.createTransport(smtp);
  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extname: ".hbs",
        layoutsDir: __dirname + "/email/layouts",
        partialsDir: __dirname + "/email/partials",
      },
      viewPath: __dirname + "/email",
      extName: ".hbs",
    }),
  );

  await transporter.sendMail({
    to,
    ...data,
  });
}
async function getUsers() {
  const users = await Db.getRepository(User).find();
  return users;
}

export async function sendNewProposalEmail(proposalId: number) {
  const proposal = await Db.getRepository(Proposal).findOne({
    where: {
      id: proposalId,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }
  const users = await getUsers();
  sendEmail(
    users.map((item) => item.email),
    {
      template: "new_proposal",
      subject: "New Proposal",
      context: {
        title: "New Proposal",
        proposal,
      },
    },
  );
}

export async function sendProposalRejectedEmail(proposalId: number) {
  const proposal = await Db.getRepository(Proposal).findOne({
    where: {
      id: proposalId,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }
  const users = await getUsers();
  sendEmail(
    users.map((item) => item.email),
    {
      template: "reject_proposal",
      subject: "Rejected Proposal",
      context: {
        title: "Rejected Proposal",
        proposal,
      },
    },
  );
}

export async function sendProposalAppliedEmail(proposalId: number) {
  const proposal = await Db.getRepository(Proposal).findOne({
    where: {
      id: proposalId,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }
  const users = await getUsers();
  sendEmail(
    users.map((item) => item.email),
    {
      template: "proposal_applied",
      subject: "Proposal Applied",
      context: {
        title: "Proposal Applied",
        proposal,
      },
    },
  );
}

export async function sendApplyRequestEmail(proposalId: number) {
  const proposal = await Db.getRepository(Proposal).findOne({
    where: {
      id: proposalId,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }
  const users = await getUsers();
  sendEmail(
    users.map((item) => item.email),
    {
      template: "apply_request",
      subject: "Apply Request",
      context: {
        title: "Apply Request",
        proposal,
      },
    },
  );
}

export async function sendApplyFinishedEmail(proposalId: number) {
  const proposal = await Db.getRepository(Proposal).findOne({
    where: {
      id: proposalId,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }
  const users = await getUsers();
  sendEmail(
    users.map((item) => item.email),
    {
      template: "apply_finished",
      subject: "Apply Finished",
      context: {
        title: "Apply Finished",
        proposal,
      },
    },
  );
}

export async function sendApplyFailedEmail(proposalId: number) {
  const proposal = await Db.getRepository(Proposal).findOne({
    where: {
      id: proposalId,
    },
  });

  if (!proposal) {
    throw new Error(`Proposal with id ${proposalId} not found`);
  }
  const users = await getUsers();
  sendEmail(
    users.map((item) => item.email),
    {
      template: "apply_failed",
      subject: "Apply Failed",
      context: {
        title: "Apply Failed",
        proposal,
      },
    },
  );
}
