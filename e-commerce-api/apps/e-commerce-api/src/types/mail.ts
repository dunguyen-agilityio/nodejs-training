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

export class ResponseError extends Error {
  code: number
  message: string
  response: {
    headers: { [key: string]: string }
    body: string
  }
}

export interface EmailProvider {
  sendWithTemplate(data: MailData): Promise<void>
}
