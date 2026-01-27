import { IMailProvider, IPaymentGatewayProvider } from "./types";

export * from "./payment-gateway";
export * from "./mail";

export type Providers = {
  MailProvider: IMailProvider;
  PaymentGatewayProvider: IPaymentGatewayProvider;
};
