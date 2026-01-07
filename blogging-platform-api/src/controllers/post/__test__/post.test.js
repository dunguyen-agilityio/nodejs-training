import assert from "node:assert/strict";
import { test, describe, beforeEach, mock } from "node:test";

import { PostController } from "../index.js";
import { createMockRes } from "#utils/test";

describe("PostController", () => {
  let mockService;
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;

  // Reset mocks before each test
  beforeEach(() => {
    mockService = {
      get: mock.fn(),
      getAll: mock.fn(),
      create: mock.fn(),
      update: mock.fn(),
      delete: mock.fn(),
    };

    controller = new PostController(mockService);
    mockReq = { query: {}, params: {}, body: {} };
    mockRes = createMockRes();
    mockNext = mock.fn();
  });

  describe("GET_ALL", () => {
    test("should return all posts with meta information", async () => {
      const mockPosts = [
        {
          id: 1,
          title: "Post 1",
          content: "Content 1",
          category: "Tech",
          tags: ["tag1"],
        },
        {
          id: 2,
          title: "Post 2",
          content: "Content 2",
          category: "Lifestyle",
          tags: ["tag2"],
        },
      ];

      mockService.getAll.mock.mockImplementation(() =>
        Promise.resolve(mockPosts)
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
        data: mockPosts,
      });
    });

    test("should return empty array when no posts exist", async () => {
      mockService.getAll.mock.mockImplementation(() => Promise.resolve([]));

      await controller.GET_ALL(mockReq, mockRes, mockNext);

      assert.strictEqual(mockRes.statusCode, 200);
      const response = mockRes.json.mock.calls[0].arguments[0];
      assert.deepStrictEqual(response, {
        meta: { total: 0 },
        data: [],
      });
    });

    test("should pass search term to service when provided", async () => {
      mockReq.query.term = "javascript";
      const filteredPosts = [
        {
          id: 1,
          title: "JavaScript Post",
          content: "JS content",
          category: "Tech",
          tags: [],
        },
      ];

      mockService.getAll.mock.mockImplementation(() =>
        Promise.resolve(filteredPosts)
      );

      await controller.GET_ALL(mockReq, mockRes, mockNext);

      // Verify service was called with search term
      assert.strictEqual(
        mockService.getAll.mock.calls[0].arguments[0],
        "javascript"
      );

      // Verify filtered results returned
      const response = mockRes.json.mock.calls[0].arguments[0];
      assert.strictEqual(response.meta.total, 1);
      assert.strictEqual(response.data[0].title, "JavaScript Post");
    });
  });

  describe("GET", () => {
    test("should return a post by ID", async () => {
      const mockPost = {
        id: 1,
        title: "Test Post",
        content: "Test Content",
        category: "Technology",
        tags: ["test"],
      };

      mockReq.params.id = "1";
      mockService.get.mock.mockImplementation(() => Promise.resolve(mockPost));

      await controller.GET(mockReq, mockRes, mockNext);

      // Verify service was called with correct ID
      assert.strictEqual(mockService.get.mock.calls.length, 1);
      assert.strictEqual(mockService.get.mock.calls[0].arguments[0], "1");

      // Verify response
      assert.strictEqual(mockRes.statusCode, 200);
      assert.strictEqual(mockRes.json.mock.calls.length, 1);
      assert.deepStrictEqual(mockRes.json.mock.calls[0].arguments[0], mockPost);
    });

    test("should return 404 when post not found", async () => {
      mockReq.params.id = "999";
      mockService.get.mock.mockImplementation(() => Promise.resolve(null));

      await controller.GET(mockReq, mockRes, mockNext);

      // Verify service was called
      assert.strictEqual(mockService.get.mock.calls.length, 1);
      assert.strictEqual(mockService.get.mock.calls[0].arguments[0], "999");

      // Verify 404 response
      assert.strictEqual(mockRes.statusCode, 404);
      assert.strictEqual(mockRes.send.mock.calls.length, 1);
      assert.strictEqual(
        mockRes.send.mock.calls[0].arguments[0],
        "Not Found Post with ID: 999"
      );
    });

    test("should handle string and numeric IDs", async () => {
      const mockPost = {
        id: 42,
        title: "Post 42",
        content: "Content",
        category: "Tech",
        tags: [],
      };
      mockReq.params.id = "42";
      mockService.get.mock.mockImplementation(() => Promise.resolve(mockPost));

      await controller.GET(mockReq, mockRes, mockNext);

      assert.strictEqual(mockService.get.mock.calls[0].arguments[0], "42");
      assert.strictEqual(mockRes.statusCode, 200);
    });
  });

  describe("POST", () => {
    test("should create a new post", async () => {
      const newPostData = {
        title: "New Post",
        content: "New Content",
        category: "Technology",
        tags: ["new", "test"],
      };

      const createdPost = {
        id: 1,
        ...newPostData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReq.body = newPostData;
      mockService.create.mock.mockImplementation(() =>
        Promise.resolve(createdPost)
      );

      await controller.POST(mockReq, mockRes, mockNext);

      // Verify service was called with request body
      assert.strictEqual(mockService.create.mock.calls.length, 1);
      assert.deepStrictEqual(
        mockService.create.mock.calls[0].arguments[0],
        newPostData
      );

      // Verify 201 Created response
      assert.strictEqual(mockRes.status.mock.calls[0].arguments[0], 201);
      assert.strictEqual(mockRes.json.mock.calls.length, 1);
      assert.deepStrictEqual(
        mockRes.json.mock.calls[0].arguments[0],
        createdPost
      );
    });

    test("should create post with all required fields", async () => {
      const completePost = {
        title: "Complete Post",
        content: "Complete Content with all fields",
        category: "Lifestyle",
        tags: ["complete", "full", "test"],
      };

      const createdPost = { id: 5, ...completePost };
      mockReq.body = completePost;
      mockService.create.mock.mockImplementation(() =>
        Promise.resolve(createdPost)
      );

      await controller.POST(mockReq, mockRes, mockNext);

      assert.strictEqual(mockRes.statusCode, 201);
      const response = mockRes.json.mock.calls[0].arguments[0];
      assert.strictEqual(response.title, "Complete Post");
      assert.strictEqual(response.category, "Lifestyle");
      assert.strictEqual(response.tags.length, 3);
    });
  });

  describe("PUT", () => {
    test("should update an existing post", async () => {
      const existingPost = {
        id: 1,
        title: "Old Title",
        content: "Old Content",
        category: "Technology",
        tags: ["old"],
      };

      const updateData = {
        title: "Updated Title",
        content: "Updated Content",
      };

      const updatedPost = {
        ...existingPost,
        ...updateData,
        updatedAt: new Date(),
      };

      mockReq.params.id = "1";
      mockReq.body = updateData;

      mockService.get.mock.mockImplementation(() =>
        Promise.resolve(existingPost)
      );
      mockService.update.mock.mockImplementation(() =>
        Promise.resolve(updatedPost)
      );

      await controller.PUT(mockReq, mockRes, mockNext);

      // Verify get was called to check existence
      assert.strictEqual(mockService.get.mock.calls.length, 1);
      assert.strictEqual(mockService.get.mock.calls[0].arguments[0], "1");

      // Verify update was called with merged data
      assert.strictEqual(mockService.update.mock.calls.length, 1);
      assert.strictEqual(mockService.update.mock.calls[0].arguments[0], "1");
      const mergedData = mockService.update.mock.calls[0].arguments[1];
      assert.strictEqual(mergedData.title, "Updated Title");
      assert.strictEqual(mergedData.content, "Updated Content");
      assert.strictEqual(mergedData.category, "Technology"); // Unchanged

      // Verify response
      assert.strictEqual(mockRes.statusCode, 200);
      assert.strictEqual(mockRes.json.mock.calls.length, 1);
      assert.deepStrictEqual(
        mockRes.json.mock.calls[0].arguments[0],
        updatedPost
      );
    });

    test("should return 404 when updating non-existent post", async () => {
      mockReq.params.id = "999";
      mockReq.body = { title: "Updated" };

      mockService.get.mock.mockImplementation(() => Promise.resolve(null));

      await controller.PUT(mockReq, mockRes, mockNext);

      // Verify get was called
      assert.strictEqual(mockService.get.mock.calls.length, 1);

      // Verify update was NOT called
      assert.strictEqual(mockService.update.mock.calls.length, 0);

      // Verify 404 response
      assert.strictEqual(mockRes.statusCode, 404);
      assert.strictEqual(
        mockRes.send.mock.calls[0].arguments[0],
        "Not Found Post with ID: 999"
      );
    });

    test("should return 500 when update fails", async () => {
      const existingPost = {
        id: 1,
        title: "Post",
        content: "Content",
        category: "Tech",
        tags: [],
      };

      mockReq.params.id = "1";
      mockReq.body = { title: "Updated" };

      mockService.get.mock.mockImplementation(() =>
        Promise.resolve(existingPost)
      );
      mockService.update.mock.mockImplementation(() => Promise.resolve(null));

      await controller.PUT(mockReq, mockRes, mockNext);

      // Verify update was attempted
      assert.strictEqual(mockService.update.mock.calls.length, 1);

      // Verify 500 response
      assert.strictEqual(mockRes.statusCode, 500);
    });

    test("should preserve unchanged fields during update", async () => {
      const existingPost = {
        id: 7,
        title: "Original",
        content: "Original Content",
        category: "Business",
        tags: ["original", "tags"],
      };

      mockReq.params.id = "7";
      mockReq.body = { title: "New Title" }; // Only update title

      mockService.get.mock.mockImplementation(() =>
        Promise.resolve(existingPost)
      );
      mockService.update.mock.mockImplementation((id, data) =>
        Promise.resolve(data)
      );

      await controller.PUT(mockReq, mockRes, mockNext);

      const updateCallData = mockService.update.mock.calls[0].arguments[1];
      assert.strictEqual(updateCallData.title, "New Title");
      assert.strictEqual(updateCallData.content, "Original Content");
      assert.strictEqual(updateCallData.category, "Business");
      assert.deepStrictEqual(updateCallData.tags, ["original", "tags"]);
    });
  });

  describe("DELETE", () => {
    test("should delete an existing post", async () => {
      const existingPost = {
        id: 1,
        title: "Post to Delete",
        content: "Content",
        category: "Tech",
        tags: [],
      };

      mockReq.params.id = "1";

      mockService.get.mock.mockImplementation(() =>
        Promise.resolve(existingPost)
      );
      mockService.delete.mock.mockImplementation(() => Promise.resolve(true));

      await controller.DELETE(mockReq, mockRes, mockNext);

      // Verify get was called to check existence
      assert.strictEqual(mockService.get.mock.calls.length, 1);
      assert.strictEqual(mockService.get.mock.calls[0].arguments[0], "1");

      // Verify delete was called
      assert.strictEqual(mockService.delete.mock.calls.length, 1);
      assert.strictEqual(mockService.delete.mock.calls[0].arguments[0], "1");

      // Verify response
      assert.strictEqual(mockRes.statusCode, 200);
      assert.strictEqual(mockRes.send.mock.calls.length, 1);
      assert.strictEqual(mockRes.send.mock.calls[0].arguments[0], true);
    });

    test("should return 404 when deleting non-existent post", async () => {
      mockReq.params.id = "999";

      mockService.get.mock.mockImplementation(() => Promise.resolve(null));

      await controller.DELETE(mockReq, mockRes, mockNext);

      // Verify get was called
      assert.strictEqual(mockService.get.mock.calls.length, 1);

      // Verify delete was NOT called
      assert.strictEqual(mockService.delete.mock.calls.length, 0);

      // Verify 404 response
      assert.strictEqual(mockRes.statusCode, 404);
      assert.strictEqual(
        mockRes.send.mock.calls[0].arguments[0],
        "Post ID: 999 does not exist"
      );
    });

    test("should return 500 when delete operation fails", async () => {
      const existingPost = {
        id: 1,
        title: "Post",
        content: "Content",
        category: "Tech",
        tags: [],
      };

      mockReq.params.id = "1";

      mockService.get.mock.mockImplementation(() =>
        Promise.resolve(existingPost)
      );
      mockService.delete.mock.mockImplementation(() => Promise.resolve(false));

      await controller.DELETE(mockReq, mockRes, mockNext);

      // Verify delete was attempted
      assert.strictEqual(mockService.delete.mock.calls.length, 1);

      // Verify 500 response
      assert.strictEqual(mockRes.statusCode, 500);
      assert.strictEqual(mockRes.send.mock.calls[0].arguments[0], false);
    });

    test("should handle deletion of post with complex data", async () => {
      const complexPost = {
        id: 42,
        title: "Complex Post with Many Tags",
        content: "Very long content...",
        category: "Technology",
        tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReq.params.id = "42";

      mockService.get.mock.mockImplementation(() =>
        Promise.resolve(complexPost)
      );
      mockService.delete.mock.mockImplementation(() => Promise.resolve(true));

      await controller.DELETE(mockReq, mockRes, mockNext);

      assert.strictEqual(mockService.delete.mock.calls[0].arguments[0], "42");
      assert.strictEqual(mockRes.statusCode, 200);
      assert.strictEqual(mockRes.sentData, true);
    });
  });
});
