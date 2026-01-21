import { AbstractMailService } from "./type";

export class SendGridMailService extends AbstractMailService {
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
