import { MailProvider, PaymentGatewayProvider } from "../providers/types";
import * as TProviders from "#providers/types";
import * as TRepositories from "#repositories/types";

export class BaseService<
  P extends PaymentGatewayProvider = any,
  M extends MailProvider = any,
> {
  public paymentGatewayProvider: P = null!;
  public mailProvider: M = null!;

  constructor(
    private repositories: any,
    base: BaseService,
  ) {
    Object.assign(this, base);
  }
}

type TDependencies = typeof TProviders & typeof TRepositories;

export type Dependencies = {
  [K in keyof TDependencies as Uncapitalize<K>]: InstanceType<TDependencies[K]>;
};
