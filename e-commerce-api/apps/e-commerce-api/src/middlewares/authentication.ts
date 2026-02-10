import type { FastifyReply, FastifyRequest } from 'fastify'

import { HttpStatus, UnauthorizedError } from '#types'

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const auth = request.clerk.getAuth(request)

  if (!auth.isAuthenticated) {
    return reply.status(HttpStatus.UNAUTHORIZED).send({
      error: 'Unauthenticated: Please log in.',
      status: HttpStatus.UNAUTHORIZED,
    })
  }

  const { userService } = request.container.services
  const user = await userService.getById(auth.userId)

  if (!user) {
    throw new UnauthorizedError('Unauthenticated: Missing user')
  }

  if (!user.stripeId) {
    const { email, name } = user
    const customer = await userService.createStripeCustomer({
      email,
      name,
    })
    user.stripeId = customer.id
    await userService.save(user)
  }

  Object.assign(request.auth, {
    ...auth,
    userId: user.id,
    stripeId: user.stripeId,
    user,
  })
}

export const authorizeAdmin = async (request: FastifyRequest) => {
  const auth = request.clerk.getAuth(request)

  if (!auth.userId) {
    throw new UnauthorizedError('Unauthenticated: Missing user')
  }

  const response =
    await request.clerk.clerkClient.users.getOrganizationMembershipList({
      userId: auth.userId,
    })

  const isAdmin = response.data.find(({ role }) => role === 'org:admin')

  if (!isAdmin) {
    throw new UnauthorizedError('Access denied: Admin role required.')
  }
}
