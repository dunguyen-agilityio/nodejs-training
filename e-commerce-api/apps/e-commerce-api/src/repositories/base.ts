import { ObjectLiteral, Repository } from "typeorm";

export class BaseRepository<
  T extends ObjectLiteral = ObjectLiteral,
> extends Repository<T> {
  constructor({ target, manager, queryRunner }: Repository<T>) {
    super(target, manager, queryRunner);
  }
}
