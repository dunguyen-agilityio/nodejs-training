import { User } from '#entities'
import { LoginParams } from '#types'

export interface IAuthService {
  register(body: User): Promise<User>
  login(params: LoginParams): Promise<{ jwt: string; data: User }>
}
