import { UserRepository } from "#repositories/types";
import { TRepository } from "#types/container";

type Payment = {
  Customer: any;
  PaymentIntent: any;
  PaymentIntentCreateParams: any;
  CustomerCreateParams: any;
};

export abstract class AbstractPaymentGateway<P = any, T extends Payment = any> {
  constructor(protected payment: P) {}

  abstract getPaymentIntents(id: string): Promise<T["PaymentIntent"]>;
  abstract createPaymentIntents(
    payload: T["PaymentIntentCreateParams"],
  ): Promise<T["PaymentIntent"]>;
  abstract createCustomer(
    params: T["CustomerCreateParams"],
  ): Promise<T["Customer"]>;
}
