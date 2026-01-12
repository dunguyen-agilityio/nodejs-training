import { User } from "@repo/typeorm-service";
import { UserRepository } from "../../repositories/user/types";
import { AuthService } from "./type";

class AuthServiceImpl extends AuthService {
  constructor(private repository: UserRepository) {
    super();
  }

  async register(body: User) {
    return await this.repository.save(body);
  }
}

export { AuthServiceImpl as AuthService };
