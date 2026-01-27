import { User } from "#entities";

export interface IUserService {
  addRoleForUser(userId: string, role: string): Promise<boolean>;
  getUserByStripeId(stripeId: string): Promise<User | null>;
  getById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
