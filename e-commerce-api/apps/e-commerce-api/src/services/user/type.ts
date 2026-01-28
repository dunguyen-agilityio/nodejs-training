import { User } from "#entities";

export interface IUserService {
  addRoleForUser(userId: string, role: string): Promise<boolean>;
  getById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
