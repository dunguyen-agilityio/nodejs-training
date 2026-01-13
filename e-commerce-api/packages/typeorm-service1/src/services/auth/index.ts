import { User } from '../../entity'
import { AbstractUserRepository } from '../../repositories/types'
import { AbstractAuthService } from './type'

export class AuthService extends AbstractAuthService {
  constructor(private repository: AbstractUserRepository) {
    super()
  }

  async checkUserExistsByPhoneOrEmail(params: {
    email?: string
    phone?: string
  }): Promise<boolean> {
    const user = await this.repository.findOne({
      where: [
        ...(params.email ? [{ email: params.email }] : []),
        ...(params.phone ? [{ phone: params.phone }] : []),
      ],
    })
    return !!user
  }

  async register(body: User) {
    const { email, phone } = body
    const existing = await this.checkUserExistsByPhoneOrEmail({ email, phone })
    if (existing) throw new Error('User existing by email or phone')

    return await this.repository.save(body)
  }
}
