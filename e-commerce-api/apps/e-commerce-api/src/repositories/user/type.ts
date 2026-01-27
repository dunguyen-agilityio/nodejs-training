import { User } from "#entities";
import { BaseRepository } from "#repositories/base";

export abstract class AbstractUserRepository extends BaseRepository<User> {
  abstract getById(id: string): Promise<User | null>;
  abstract getByStripeId(stripeId: string): Promise<User | null>;
  abstract getUserRelationsById(id: string): Promise<User | null>;
}
