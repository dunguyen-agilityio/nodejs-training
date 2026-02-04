import { User } from '#entities'

export interface IAuthService {
  register(body: User): Promise<User>
}
