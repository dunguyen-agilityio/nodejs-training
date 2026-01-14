import { ObjectLiteral } from "typeorm";
import { BaseRepository } from "../repositories/base";

export class BaseService<
  T extends ObjectLiteral,
  R extends BaseRepository<T> = BaseRepository<T>,
> {
  constructor(protected repository: R) {}
}
