import fp from 'fastify-plugin'

import Stripe from 'stripe'

import env from '#env'

export default fp(async (fastify) => {
  const stripe = new Stripe(env.stripe.secretKey, {
    apiVersion: '2025-12-15.clover',
  })
  fastify.decorate('stripe', stripe)
})
