import { BaseProvider } from "../base";

type Payment = {
  Customer: any;
  PaymentIntent: any;
  PaymentIntentCreateParams: any;
  CustomerCreateParams: any;
};

export abstract class AbstractPaymentGatewayProvider<
  P = any,
  T extends Payment = any,
> extends BaseProvider<P> {
  abstract getPaymentIntents(id: string): Promise<T["PaymentIntent"]>;
  abstract createPaymentIntents(
    payload: T["PaymentIntentCreateParams"],
  ): Promise<T["PaymentIntent"]>;
  abstract createCustomer(
    params: T["CustomerCreateParams"],
  ): Promise<T["Customer"]>;
}
