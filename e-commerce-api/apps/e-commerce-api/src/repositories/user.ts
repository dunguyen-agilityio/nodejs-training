import { User } from "@repo/typeorm-service";
import { Repository } from "typeorm";
import { UserRepository } from "./type";

class UserRepositoryImpl extends UserRepository {
  constructor(repo: Repository<User>) {
    super(repo.target, repo.manager);
  }

  async login(body: User) {
    return await this.save(body);
  }
}

export { UserRepositoryImpl as UserRepository };
