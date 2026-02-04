export type EmailData = string | { name?: string; email: string }

export interface MailContent {
  type: string
  value: string
}

export interface MailData {
  to: EmailData | EmailData[]
  from: EmailData
  text?: string
  templateId?: string
  subject?: string
  dynamicTemplateData?: { [key: string]: any }
}

/**
 * Error class for email service failures
 */
export class EmailResponseError extends Error {
  code: number
  response: {
    headers: { [key: string]: string }
    body: string
  }

  constructor(
    message: string,
    code: number,
    response: { headers: { [key: string]: string }; body: string },
  ) {
    super(message)
    this.name = 'EmailResponseError'
    this.code = code
    this.response = response
  }
}

/**
 * Interface for email provider implementations
 */
export interface EmailProvider {
  sendWithTemplate(data: MailData): Promise<void>
}
