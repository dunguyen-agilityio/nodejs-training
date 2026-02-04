import fp from 'fastify-plugin'

import Stripe from 'stripe'

import { env } from '../configs/env'

export default fp(async (fastify) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
  fastify.decorate('stripe', stripe)
})
