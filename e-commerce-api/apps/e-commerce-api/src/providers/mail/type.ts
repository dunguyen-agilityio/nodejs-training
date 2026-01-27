import { MailData } from "#types/mail";

export interface IMailProvider {
  sendWithTemplate(data: MailData): Promise<void>;
  send(data: MailData): Promise<void>;
}
