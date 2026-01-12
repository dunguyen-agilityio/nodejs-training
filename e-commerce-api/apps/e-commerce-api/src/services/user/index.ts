import { User } from "@repo/typeorm-service";
import { UserService } from "./type";
import { UserRepository } from "../../repositories/user/types";

class UserServiceImpl implements UserService {
  constructor(private repository: UserRepository) {}

  async getUserById(id: string): Promise<User> {
    return this.repository.getById(id);
  }
}

export { UserServiceImpl as UserService };
