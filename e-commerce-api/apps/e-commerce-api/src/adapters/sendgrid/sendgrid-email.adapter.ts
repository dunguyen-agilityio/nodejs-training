import { FastifyBaseLogger } from 'fastify'

import { MailService } from '@sendgrid/mail'

import { EmailProvider, MailData } from '#types'

export class SendGridEmailAdapter implements EmailProvider {
  constructor(
    private sendgrid: MailService,
    private logger: FastifyBaseLogger,
  ) {}

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
        if (!error) {
          this.logger.info('Email sent successfully')
        } else {
          if ('response' in error) {
            this.logger.error(
              `Error - sendWithTemplate: ${error.response.body}`,
            )
          } else {
            this.logger.error(`Error - sendWithTemplate: ${error.message}`)
          }
        }
      },
    )
  }
}
