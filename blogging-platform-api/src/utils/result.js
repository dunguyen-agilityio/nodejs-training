/**
 * @template T
 */
export class Result {
  /**
   *
   * @param {T|string} param
   */
  constructor(param) {
    if (typeof param === "string") {
      this.success = false;
      this.failed = true;
      this.error = { message: param };
    } else {
      this.success = true;
      this.failed = false;
      this.data = param;
    }
  }
}
