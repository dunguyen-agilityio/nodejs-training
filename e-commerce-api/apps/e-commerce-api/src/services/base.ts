import { TRepository } from "#types/container";

export abstract class BaseService {
  constructor(repositories: Partial<TRepository>) {
    Object.assign(this, repositories);
  }
}
