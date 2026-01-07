import { mock } from "node:test";

export const createMockRes = () => ({
  json: mock.fn(),
  status: mock.fn(function (code) {
    this.statusCode = code;
    return this;
  }),
  send: mock.fn(function (data) {
    this.sentData = data;
    return this;
  }),
  statusCode: 200,
  sentData: null,
});
