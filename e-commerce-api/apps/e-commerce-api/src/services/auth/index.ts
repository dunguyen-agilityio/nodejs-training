import { User } from "@repo/typeorm-service";
import { UserRepository } from "../../repositories/type";
import { AuthService } from "./type";

class AuthServiceImpl extends AuthService {
  constructor(private repository: UserRepository) {
    super();
  }

  async login(body: User) {
    return await this.repository.login(body);
  }
}

export { AuthServiceImpl as AuthService };
