import { User } from '../../entity'

export abstract class UserService {
  abstract getUserById(id: string): Promise<User>
  abstract checkUserExistsByPhoneOrEmail(params: {
    phone?: string
    email?: string
  }): Promise<boolean>
}
