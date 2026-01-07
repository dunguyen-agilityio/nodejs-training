import assert from "node:assert/strict";
import { test, describe, beforeEach, mock } from "node:test";

import { CategoryService } from "../index.js";

describe("CategoryService", () => {
  let mockRepository;
  let service;

  // Reset mocks before each test
  beforeEach(() => {
    mockRepository = {
      getAll: mock.fn(),
    };

    service = new CategoryService(mockRepository);
  });

  describe("getAll", () => {
    test("should return all categories", async () => {
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

      mockRepository.getAll.mock.mockImplementation(() =>
        Promise.resolve(mockCategories)
      );

      const response = await service.getAll();

      // Verify service was called without search term
      assert.strictEqual(mockRepository.getAll.mock.calls.length, 1);
      assert.strictEqual(
        mockRepository.getAll.mock.calls[0].arguments[0],
        undefined
      );

      // Verify response
      assert.strictEqual(response, mockCategories);
    });

    test("should return empty array when no categories exist", async () => {
      mockRepository.getAll.mock.mockImplementation(() => Promise.resolve([]));

      const response = await service.getAll();

      assert.deepStrictEqual(response, []);
    });
  });
});
