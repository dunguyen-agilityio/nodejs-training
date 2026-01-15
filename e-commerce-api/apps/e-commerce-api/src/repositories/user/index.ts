import { Repository } from "typeorm";
import { AbstractUserRepository } from "./type";
import { User } from "#entities";

export class UserRepository extends AbstractUserRepository {
  constructor(repo: Repository<User>) {
    super(User, repo.manager);
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.findOne({ where: { id } });
    return user;
  }
}
