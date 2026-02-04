import { User } from '#entities'

import { LoginParams } from '#types/auth'

export interface IAuthService {
  register(body: User): Promise<User>
  login(params: LoginParams): Promise<{ jwt: string; data: User }>
}
