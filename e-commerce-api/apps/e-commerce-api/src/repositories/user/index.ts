import { Repository } from "typeorm";
import { AbstractUserRepository } from "./type";
import { User } from "#entities";

export class UserRepository extends AbstractUserRepository {
  constructor(repo: Repository<User>) {
    super(User, repo.manager);
  }

  async getById(id: string): Promise<User> {
    const user = await this.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }
}
