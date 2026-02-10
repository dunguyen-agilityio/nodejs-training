import { FastifyBaseLogger } from 'fastify'

import fs from 'node:fs'
import url from 'node:url'
import { Resend } from 'resend'

import { EmailData, EmailProvider, MailData } from '#types'

export function renderTemplate(template: string, data: Record<string, string>) {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] ?? '')
}

const format = (email: EmailData) =>
  typeof email === 'string' ? email : email.email

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const toList = (to: EmailData | EmailData[]) =>
  Array.isArray(to) ? to.map(format) : format(to)

export class ResendEmailAdapter implements EmailProvider {
  constructor(
    private resend: Resend,
    private logger: FastifyBaseLogger,
  ) {}

  async sendWithTemplate({
    to,
    from,
    dynamicTemplateData,
    templateName,
    subject,
  }: Required<MailData>): Promise<void> {
    try {
      const template = fs.readFileSync(
        `${__dirname}/templates/${templateName}.html`,
        'utf-8',
      )

      const html = renderTemplate(template, dynamicTemplateData)

      this.logger.info(
        {
          to,
          from,
          subject,
          html,
        },
        'Email sent',
      )

      await this.resend.emails.send({
        from: format(from),
        to: toList(to),
        subject: subject!,
        html: html!,
      })
    } catch (error) {
      this.logger.info(error, 'Failed to send email')
    }
  }
}
