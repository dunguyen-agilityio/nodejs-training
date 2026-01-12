import { User } from "@repo/typeorm-service";
import { Repository } from "typeorm";
import { UserRepository } from "./types";

class UserRepositoryImpl extends UserRepository {
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

export { UserRepositoryImpl as UserRepository };
