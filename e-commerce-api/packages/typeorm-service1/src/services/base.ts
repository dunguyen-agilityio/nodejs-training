import { AbstractRepository } from '../repositories/base'

export abstract class AbstractService<T> {
  constructor(private repository: AbstractRepository<T>) {}
}
