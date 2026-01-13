import { ObjectLiteral } from "typeorm";
import { BaseRepository } from "../repositories/base";

export class BaseService<T extends ObjectLiteral> {
  constructor(protected repository: BaseRepository<T>) {}
}
