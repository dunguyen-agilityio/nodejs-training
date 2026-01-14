import { ObjectLiteral } from "typeorm";
import { BaseService } from "../services/base";

export class BaseController<
  T extends ObjectLiteral = ObjectLiteral,
  S extends BaseService<T> = BaseService<T>,
> {
  constructor(protected service: S) {}
}
