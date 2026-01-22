import { BaseProvider } from "#providers/base";

type Payment<C = any, P = any, R = any, E = any> = {
  Customer: C;
  PaymentIntent: P;
  PaymentIntentCreateParams: R;
  CustomerCreateParams: E;
};

export abstract class AbstractPaymentGatewayProvider<
  P = any,
  T extends Payment = Payment,
> extends BaseProvider<P> {
  abstract getPaymentIntents(id: string): Promise<T["PaymentIntent"]>;
  abstract createPaymentIntents(
    payload: T["PaymentIntentCreateParams"],
  ): Promise<T["PaymentIntent"]>;
  abstract createCustomer(
    params: T["CustomerCreateParams"],
  ): Promise<T["Customer"]>;
}
