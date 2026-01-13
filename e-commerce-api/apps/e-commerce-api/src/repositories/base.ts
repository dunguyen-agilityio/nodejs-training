import { ObjectLiteral, Repository } from "typeorm";

export class BaseRepository<
  T extends ObjectLiteral = ObjectLiteral,
> extends Repository<T> {
  constructor({ target, manager }: Repository<T>) {
    super(target, manager);
  }
}
