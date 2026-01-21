import { AbstractUserRepository } from "./type";
import { User } from "#entities";

export class UserRepository extends AbstractUserRepository {
  async getById(id: string): Promise<User | null> {
    const user = await this.findOne({ where: { id } });
    return user;
  }

  async getByStripeId(stripeId: string): Promise<User | null> {
    const user = await this.findOne({ where: { stripeId } });
    return user;
  }
}
