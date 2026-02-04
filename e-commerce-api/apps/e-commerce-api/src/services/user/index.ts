import { IUserService } from "./type";
import { USER_ROLES } from "#types/user";
import { User } from "#entities";
import { UserRepository } from "#repositories/types";
import { CustomerCreateParams, Customer, PaymentGateway } from "#types/payment";

export class UserService implements IUserService {
  constructor(
    private userRepository: UserRepository,
    private paymentGateway: PaymentGateway,
  ) {}

  async addRoleForUser(userId: string, role: USER_ROLES): Promise<boolean> {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      return false;
    }
    await this.userRepository.save({ ...user, role });
    return true;
  }

  async getById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async createStripeCustomer(params: CustomerCreateParams): Promise<Customer> {
    return await this.paymentGateway.createCustomer(params);
  }
}
