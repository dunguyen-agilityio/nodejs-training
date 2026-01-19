import { User } from "#entities";
import { Repository } from "typeorm";

export abstract class AbstractUserRepository extends Repository<User> {
  abstract getById(id: string): Promise<User | null>;
  abstract getByStripeId(stripeId: string): Promise<User | null>;
}
