import { ClerkClient } from '@clerk/fastify'

import env from '#env'

import { IIdentityProvider, LoginResult } from '#types'

export class ClerkIdentityProvider implements IIdentityProvider {
  constructor(private client: ClerkClient) {}

  async login(identifier: string, password: string): Promise<LoginResult> {
    const users = await this.client.users.getUserList({
      emailAddress: [identifier],
      limit: 1,
    })

    if (users.totalCount === 0) {
      throw new Error('User not found')
    }

    const { id: userId } = users.data[0]!

    const signInAttempt = await this.client.users.verifyPassword({
      password,
      userId,
    })

    if (!signInAttempt.verified) {
      throw new Error('Login failed: Invalid password')
    }

    const session = await this.client.sessions.createSession({ userId })

    const token = await this.client.sessions.getToken(
      session.id,
      env.client.tokenTemplate,
      60,
    )

    return {
      status: 'complete',
      createdSessionId: session.id,
      ...token,
    }
  }
}
