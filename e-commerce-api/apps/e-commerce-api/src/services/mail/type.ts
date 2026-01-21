import { BaseService } from "#services/base";
import sgMail from "@sendgrid/mail";

export abstract class AbstractMailService extends BaseService<
  any,
  sgMail.MailService
> {
  abstract sendWithTemplate(
    from: string,
    to: string,
    data: Record<string, any>,
    templateId: string,
  ): Promise<void>;
}
