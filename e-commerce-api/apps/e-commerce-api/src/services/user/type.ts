import { User } from "@repo/typeorm-service";

export abstract class UserService {
  abstract getUserById(id: string): Promise<User>;
}
