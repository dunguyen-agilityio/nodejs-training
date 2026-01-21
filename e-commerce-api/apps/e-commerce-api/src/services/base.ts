import { TRepository } from "#types/container";

export class BaseService<P = object, M = object> {
  constructor(
    repositories: Partial<TRepository>,
    protected paymentGetway: P,
    protected mail: M,
  ) {
    Object.assign(this, repositories);
  }
}
