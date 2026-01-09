import { User } from "@repo/typeorm-service";

export abstract class AuthService {
  abstract login(body: any): Promise<User>;
}
