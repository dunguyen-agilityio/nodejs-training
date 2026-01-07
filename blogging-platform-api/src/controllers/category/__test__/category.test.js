import assert from "node:assert/strict";
import { test, describe, beforeEach, mock } from "node:test";

import { CategoryController } from "../index.js";
import { createMockRes } from "#utils/test";

describe("CategoryController", () => {
  let mockService;
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;

  // Reset mocks before each test
  beforeEach(() => {
    mockService = {
      getAll: mock.fn(),
    };

    controller = new CategoryController(mockService);
    mockReq = { query: {}, params: {}, body: {} };
    mockRes = createMockRes();
    mockNext = mock.fn();
  });

  describe("GET_ALL", () => {
    test("should return all categories with meta information", async () => {
      const mockCategories = [
        {
          id: 1,
          name: "Category 1",
        },
        {
          id: 2,
          title: "Category 2",
        },
      ];

      mockService.getAll.mock.mockImplementation(() =>
        Promise.resolve(mockCategories)
      );

      await controller.GET_ALL(mockReq, mockRes, mockNext);

      // Verify service was called without search term
      assert.strictEqual(mockService.getAll.mock.calls.length, 1);
      assert.strictEqual(
        mockService.getAll.mock.calls[0].arguments[0],
        undefined
      );

      // Verify response
      assert.strictEqual(mockRes.status.mock.calls.length, 1);
      assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 200);
      assert.strictEqual(mockRes.json.mock.calls.length, 1);

      const response = mockRes.json.mock.calls[0].arguments[0];
      assert.deepStrictEqual(response, {
        meta: { total: 2 },
        data: mockCategories,
      });
    });

    test("should return empty array when no categories exist", async () => {
      mockService.getAll.mock.mockImplementation(() => Promise.resolve([]));

      await controller.GET_ALL(mockReq, mockRes, mockNext);

      assert.strictEqual(mockRes.statusCode, 200);
      const response = mockRes.json.mock.calls[0].arguments[0];
      assert.deepStrictEqual(response, {
        meta: { total: 0 },
        data: [],
      });
    });
  });
});
