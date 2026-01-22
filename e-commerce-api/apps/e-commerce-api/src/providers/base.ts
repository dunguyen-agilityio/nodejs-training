export class BaseProvider<T = unknown> {
  constructor(protected context: T) {}
}
