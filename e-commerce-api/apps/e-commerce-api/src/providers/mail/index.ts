import { MailData, ResponseError } from "#types/mail";
import { IMailProvider } from "./type";
import sgMail from "@sendgrid/mail";

export class SendGridMailProvider implements IMailProvider {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async send({
    from,
    to,
    text,
    subject,
  }: MailData & Required<Pick<MailData, "text">>): Promise<void> {
    await sgMail.send({ to, from, text, subject }, false, (error, result) => {
      if (error) {
        if (error instanceof ResponseError) {
          console.log(error.response.body);
        }
        console.log(
          "Failed to send mail: ",
          (error as ResponseError).response.body,
        );
      } else {
        console.log(result);
      }
    });
  }

  async sendWithTemplate({
    to,
    from,
    templateId,
    dynamicTemplateData,
  }: MailData & Required<Pick<MailData, "templateId">>): Promise<void> {
    await sgMail.send(
      { to, from, templateId, dynamicTemplateData },
      false,
      (error) => {
        if (error) {
          console.log("Failed to send mail: ", error);
        }
      },
    );
  }
}
