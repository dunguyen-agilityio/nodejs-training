import { IMailProvider, IPaymentGatewayProvider } from "#providers/types";
import * as TRepositories from "#repositories/types";

type TDependencies = typeof TRepositories & {
  mailProvider: IMailProvider;
  paymentGatewayProvider: IPaymentGatewayProvider;
};

export type Dependencies = {
  [K in keyof TDependencies as Uncapitalize<K>]: TDependencies[K];
};
