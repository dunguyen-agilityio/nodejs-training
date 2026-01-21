export class BaseProvider<P = unknown, M = unknown> {
  constructor(
    protected payment: P,
    protected mail: M,
  ) {}
}
