import { EmailProvider, MailData } from '#types'
import { MailService } from '@sendgrid/mail'

export default class ResponseError extends Error {
  code: number
  message: string
  response: {
    headers: { [key: string]: string }
    body: string
  }
}

export class SendGridEmailAdapter implements EmailProvider {
  constructor(private sendgrid: MailService) {}

  async sendWithTemplate({
    to,
    from,
    templateId,
    dynamicTemplateData,
  }: MailData & Required<Pick<MailData, 'templateId'>>): Promise<void> {
    await this.sendgrid.send(
      { to, from, templateId, dynamicTemplateData },
      false,
      (error) => {
        if (error instanceof ResponseError) {
          console.error('Error - sendWithTemplate: ', error.response.body)
        }
      },
    )
  }
}
