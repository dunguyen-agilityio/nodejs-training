import { BaseService } from "#services/base";

export class BaseController<S extends BaseService = BaseService> {
  constructor(protected service: S) {}
}
