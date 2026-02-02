import { MailData } from "#types/mail";
import { IMailProvider } from "./type";
import sgMail from "@sendgrid/mail";

export class SendGridMailProvider implements IMailProvider {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
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
        if (error instanceof ResponseError) {
          console.error("Error - sendWithTemplate: ", error.response.body);
        }
      },
    );
  }
}

export default class ResponseError extends Error {
  code: number;
  message: string;
  response: {
    headers: { [key: string]: string };
    body: string;
  };
}
