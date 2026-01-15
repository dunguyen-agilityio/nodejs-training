import { User } from "#entities";
import { AbstractAuthService } from "./type";

export class AuthService extends AbstractAuthService {
  async register(body: User) {
    const user = await this.userRepository.save(body);
    await this.cartRepository.save({ user });
    return user;
  }
}
