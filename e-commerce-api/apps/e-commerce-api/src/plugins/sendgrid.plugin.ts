import fp from 'fastify-plugin'

import sgMail from '@sendgrid/mail'
import { Resend } from 'resend'

import { env } from '../configs/env'

export default fp(async (fastify) => {
  sgMail.setApiKey(env.mail.apiKey)
  const resend = new Resend(process.env.RESEND_API_KEY)

  fastify.decorate('sendgrid', sgMail)
  fastify.decorate('resend', resend)
})
