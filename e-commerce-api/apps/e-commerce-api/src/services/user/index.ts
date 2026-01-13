import { AbstractUserService } from "./type";
import { AbstractUserRepository } from "../../repositories/user/type";
import { User } from "#entities";

export class UserService implements AbstractUserService {
  constructor(private repository: AbstractUserRepository) {}

  async getUserById(id: string): Promise<User> {
    return this.repository.getById(id);
  }
}
