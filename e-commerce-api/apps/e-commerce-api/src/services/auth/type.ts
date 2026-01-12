import { User } from "@repo/typeorm-service";

export abstract class AuthService {
  abstract register(body: User): Promise<User>;
}
