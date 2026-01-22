import { MailProvider, PaymentGatewayProvider } from "../providers/types";

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
