import { User } from '../../entity'

export abstract class AbstractAuthService {
  abstract register(body: User): Promise<User>

  abstract checkUserExistsByPhoneOrEmail(params: {
    email?: string
    phone?: string
  }): Promise<boolean>
}
