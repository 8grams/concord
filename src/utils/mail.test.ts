import { expect, test } from "vitest";
import { sendEmail } from "./mailer";

test("Send email", async () => {
  expect(
    sendEmail("fiik346@gmail.com", {
      subject: "test",
      template: "new_proposal",
      context: {
        proposal: {},
      },
    }),
  );
});
