import { User } from "@repo/typeorm-service";
import { Repository } from "typeorm";

export abstract class UserRepository extends Repository<User> {
  abstract login(body: any): Promise<User>;
}
