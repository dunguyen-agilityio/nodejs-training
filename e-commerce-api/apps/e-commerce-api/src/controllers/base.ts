import { ObjectLiteral } from "typeorm";
import { BaseService } from "../services/base";

export class BaseController<T extends ObjectLiteral> {
  constructor(private service: BaseService<T>) {}
}
