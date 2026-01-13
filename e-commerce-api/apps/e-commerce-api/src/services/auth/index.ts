import { User } from "#entities";
import { AbstractAuthService } from "./type";

export class AuthService extends AbstractAuthService {
  async register(body: User) {
    return await this.repository.save(body);
  }
}
