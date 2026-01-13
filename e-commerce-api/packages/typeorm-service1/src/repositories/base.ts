import { Repository } from 'typeorm'

export class AbstractRepository<T> extends Repository<T> {
  constructor({ target, manager }: Repository<T>) {
    super(target, manager)
  }
}
