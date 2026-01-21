import { AbstractMailProvider } from "./type";
import sgMail from "@sendgrid/mail";

export class SendGridMailProvider extends AbstractMailProvider<sgMail.MailService> {
  async sendWithTemplate(
    from: string,
    to: string,
    data: Record<string, any>,
    templateId: string,
  ): Promise<void> {
    const msg = {
      from, //process.env.SENDGRID_FROM_EMAIL!, // Change to your recipient
      to, // Change to your verified sender
    };

    await this.mail.send({
      ...msg,
      dynamicTemplateData: data,
      templateId, ///process.env.SENDGRID_TEMPLATE_ID!,
    });
  }
}
