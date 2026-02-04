import fp from 'fastify-plugin'

import sgMail from '@sendgrid/mail'

import { env } from '../configs/env'

export default fp(async (fastify) => {
  sgMail.setApiKey(env.sendgrid.apiKey)
  fastify.decorate('sendgrid', sgMail)
})
