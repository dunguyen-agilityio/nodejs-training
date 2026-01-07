import assert from "node:assert/strict";
import { test, describe, beforeEach, mock } from "node:test";

import { PostService } from "../index.js";

describe("PostService", () => {
  let mockRepository;
  let categoryService, postTagService, tagService;
  let service;

  // Reset mocks before each test
  beforeEach(() => {
    mockRepository = {
      getAll: mock.fn(),
      get: mock.fn(),
      create: mock.fn(),
      update: mock.fn(),
      delete: mock.fn(),
    };

    categoryService = {
      getAll: mock.fn(),
      createIfNotExists: mock.fn(),
    };

    tagService = {
      createIfNotExists: mock.fn(),
    };

    postTagService = {
      create: mock.fn(),
      createIfNotExists: mock.fn(),
    };

    service = new PostService(
      mockRepository,
      categoryService,
      postTagService,
      tagService
    );
  });

  describe("getAll", () => {
    test("should return all posts", async () => {
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

      mockRepository.getAll.mock.mockImplementation(() =>
        Promise.resolve(mockPosts)
      );

      const response = await service.getAll();

      // Verify repository was called without search term
      assert.strictEqual(mockRepository.getAll.mock.calls.length, 1);
      assert.strictEqual(
        mockRepository.getAll.mock.calls[0].arguments[0],
        undefined
      );

      // Verify response
      assert.strictEqual(response, mockPosts);
    });

    test("should return empty array when no posts exist", async () => {
      mockRepository.getAll.mock.mockImplementation(() => Promise.resolve([]));

      const response = await service.getAll();

      assert.deepStrictEqual(response, []);
    });

    test("should pass search term to service when provided", async () => {
      const term = "javascript";
      const filteredPosts = [
        {
          id: 1,
          title: "JavaScript Post",
          content: "JS content",
          category: "Tech",
          tags: [],
        },
      ];

      mockRepository.getAll.mock.mockImplementation(() =>
        Promise.resolve(filteredPosts)
      );

      const response = await service.getAll(term);

      // Verify repository was called with search term
      assert.strictEqual(
        mockRepository.getAll.mock.calls[0].arguments[0],
        term
      );

      // Verify filtered results returned
      assert.strictEqual(response[0].title, "JavaScript Post");
    });
  });

  describe("get", () => {
    test("should return a post by ID", async () => {
      const mockPost = {
        id: 1,
        title: "Test Post",
        content: "Test Content",
        category: "Technology",
        tags: ["test"],
      };

      const id = "1";
      mockRepository.get.mock.mockImplementation(() =>
        Promise.resolve(mockPost)
      );

      const response = await service.get(id);

      // Verify repository was called with correct ID
      assert.strictEqual(mockRepository.get.mock.calls.length, 1);
      assert.strictEqual(mockRepository.get.mock.calls[0].arguments[0], id);

      // Verify response
      assert.deepStrictEqual(response, mockPost);
    });

    test("should return null when post not found", async () => {
      const id = "999";
      mockRepository.get.mock.mockImplementation(() => Promise.resolve(null));

      const response = await service.get(id);

      // Verify repository was called
      assert.strictEqual(mockRepository.get.mock.calls.length, 1);
      assert.strictEqual(mockRepository.get.mock.calls[0].arguments[0], id);

      // Verify response
      assert.strictEqual(response, null);
    });
  });

  describe("create", () => {
    test("should create a new post with category and tags", async () => {
      const newPostData = {
        title: "New Post",
        content: "New Content",
        category: "Technology",
        tags: ["new", "test"],
      };

      const mockCategory = {
        id: 1,
        name: "Technology",
      };

      const mockTags = [
        { id: 1, name: "new" },
        { id: 2, name: "test" },
      ];

      const createdPostResult = {
        lastID: 1,
      };

      const createdPost = {
        id: 1,
        title: "New Post",
        content: "New Content",
        category: "Technology",
        tags: ["new", "test"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock category creation
      categoryService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve(mockCategory)
      );

      // Mock post creation
      mockRepository.create.mock.mockImplementation(() =>
        Promise.resolve(createdPostResult)
      );

      // Mock tag creation
      tagService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve(mockTags)
      );

      // Mock post-tag association
      postTagService.create.mock.mockImplementation(() => Promise.resolve());

      // Mock getting the created post
      mockRepository.get.mock.mockImplementation(() =>
        Promise.resolve(createdPost)
      );

      const response = await service.create(newPostData);

      // Verify category service was called
      assert.strictEqual(
        categoryService.createIfNotExists.mock.calls.length,
        1
      );
      assert.strictEqual(
        categoryService.createIfNotExists.mock.calls[0].arguments[0],
        "Technology"
      );

      // Verify repository was called with correct data
      assert.strictEqual(mockRepository.create.mock.calls.length, 1);
      const createArgs = mockRepository.create.mock.calls[0].arguments[0];
      assert.strictEqual(createArgs.title, "New Post");
      assert.strictEqual(createArgs.content, "New Content");
      assert.strictEqual(createArgs.category, 1); // Category ID

      // Verify tags were created
      assert.strictEqual(tagService.createIfNotExists.mock.calls.length, 1);
      assert.deepStrictEqual(
        tagService.createIfNotExists.mock.calls[0].arguments[0],
        ["new", "test"]
      );

      // Verify post-tag associations were created
      assert.strictEqual(postTagService.create.mock.calls.length, 1);
      assert.strictEqual(postTagService.create.mock.calls[0].arguments[0], 1); // Post ID
      assert.deepStrictEqual(
        postTagService.create.mock.calls[0].arguments[1],
        mockTags
      );

      // Verify final post retrieval
      assert.strictEqual(mockRepository.get.mock.calls.length, 1);
      assert.strictEqual(mockRepository.get.mock.calls[0].arguments[0], 1);

      // Verify response
      assert.deepStrictEqual(response, createdPost);
    });

    test("should create post without tags", async () => {
      const newPostData = {
        title: "Post Without Tags",
        content: "Content without tags",
        category: "Lifestyle",
        tags: [],
      };

      const mockCategory = {
        id: 2,
        name: "Lifestyle",
      };

      const createdPostResult = {
        lastID: 2,
      };

      const createdPost = {
        id: 2,
        title: "Post Without Tags",
        content: "Content without tags",
        category: "Lifestyle",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock category creation
      categoryService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve(mockCategory)
      );

      // Mock post creation
      mockRepository.create.mock.mockImplementation(() =>
        Promise.resolve(createdPostResult)
      );

      // Mock getting the created post
      mockRepository.get.mock.mockImplementation(() =>
        Promise.resolve(createdPost)
      );

      const response = await service.create(newPostData);

      // Verify tags service was NOT called (no tags)
      assert.strictEqual(tagService.createIfNotExists.mock.calls.length, 0);
      assert.strictEqual(postTagService.create.mock.calls.length, 0);

      // Verify response
      assert.strictEqual(response.id, 2);
      assert.strictEqual(response.tags.length, 0);
    });

    test("should handle post creation with new category", async () => {
      const newPostData = {
        title: "New Category Post",
        content: "Content in new category",
        category: "New Category",
        tags: ["tag1"],
      };

      const mockCategory = {
        id: 99,
        name: "New Category",
      };

      const createdPostResult = {
        lastID: 3,
      };

      const createdPost = {
        id: 3,
        ...newPostData,
        category: "New Category",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      categoryService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve(mockCategory)
      );

      mockRepository.create.mock.mockImplementation(() =>
        Promise.resolve(createdPostResult)
      );

      tagService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve([{ id: 1, name: "tag1" }])
      );

      postTagService.create.mock.mockImplementation(() => Promise.resolve());

      mockRepository.get.mock.mockImplementation(() =>
        Promise.resolve(createdPost)
      );

      const response = await service.create(newPostData);

      // Verify category service was called with new category name
      assert.strictEqual(
        categoryService.createIfNotExists.mock.calls[0].arguments[0],
        "New Category"
      );

      // Verify post was created with category ID
      assert.strictEqual(
        mockRepository.create.mock.calls[0].arguments[0].category,
        99
      );

      assert.strictEqual(response.category, "New Category");
    });
  });

  describe("update", () => {
    test("should update an existing post", async () => {
      const postId = "1";
      const updateData = {
        title: "Updated Title",
        content: "Updated Content",
        category: "Updated Category",
        tags: ["updated", "tags"],
      };

      const mockCategory = {
        id: 5,
        name: "Updated Category",
      };

      const mockTags = [
        { id: 10, name: "updated" },
        { id: 11, name: "tags" },
      ];

      const updateResult = {
        changes: 1,
      };

      const updatedPost = {
        id: 1,
        title: "Updated Title",
        content: "Updated Content",
        category: "Updated Category",
        tags: ["updated", "tags"],
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date(),
      };

      // Mock category creation
      categoryService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve(mockCategory)
      );

      // Mock repository update
      mockRepository.update.mock.mockImplementation(() =>
        Promise.resolve(updateResult)
      );

      // Mock tag creation
      tagService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve(mockTags)
      );

      // Mock post-tag association
      postTagService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve()
      );

      // Mock getting the updated post
      mockRepository.get.mock.mockImplementation(() =>
        Promise.resolve(updatedPost)
      );

      const response = await service.update(postId, updateData);

      // Verify category service was called
      assert.strictEqual(
        categoryService.createIfNotExists.mock.calls.length,
        1
      );
      assert.strictEqual(
        categoryService.createIfNotExists.mock.calls[0].arguments[0],
        "Updated Category"
      );

      // Verify repository update was called
      assert.strictEqual(mockRepository.update.mock.calls.length, 1);
      assert.strictEqual(
        mockRepository.update.mock.calls[0].arguments[0],
        postId
      );
      const updateArgs = mockRepository.update.mock.calls[0].arguments[1];
      assert.strictEqual(updateArgs.title, "Updated Title");
      assert.strictEqual(updateArgs.content, "Updated Content");
      assert.strictEqual(updateArgs.category, 5); // Category ID

      // Verify tags were updated
      assert.strictEqual(tagService.createIfNotExists.mock.calls.length, 1);
      assert.deepStrictEqual(
        tagService.createIfNotExists.mock.calls[0].arguments[0],
        ["updated", "tags"]
      );

      // Verify post-tag associations were updated
      assert.strictEqual(postTagService.createIfNotExists.mock.calls.length, 1);
      assert.strictEqual(
        postTagService.createIfNotExists.mock.calls[0].arguments[0],
        postId
      );
      assert.deepStrictEqual(
        postTagService.createIfNotExists.mock.calls[0].arguments[1],
        mockTags
      );

      // Verify response
      assert.deepStrictEqual(response, updatedPost);
    });

    test("should return null when updating non-existent post", async () => {
      const postId = "999";
      const updateData = {
        title: "Updated Title",
        content: "Updated Content",
        category: "Tech",
        tags: [],
      };

      const mockCategory = {
        id: 1,
        name: "Tech",
      };

      const updateResult = {
        changes: 0, // No rows updated
      };

      categoryService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve(mockCategory)
      );

      mockRepository.update.mock.mockImplementation(() =>
        Promise.resolve(updateResult)
      );

      const response = await service.update(postId, updateData);

      // Verify repository update was attempted
      assert.strictEqual(mockRepository.update.mock.calls.length, 1);

      // Verify null is returned when no changes
      assert.strictEqual(response, null);

      // Verify get was NOT called (short-circuited due to no changes)
      assert.strictEqual(mockRepository.get.mock.calls.length, 0);
    });

    test("should update post without tags", async () => {
      const postId = "2";
      const updateData = {
        title: "Updated Without Tags",
        content: "Updated content",
        category: "Lifestyle",
        tags: [],
      };

      const mockCategory = {
        id: 2,
        name: "Lifestyle",
      };

      const updateResult = {
        changes: 1,
      };

      const updatedPost = {
        id: 2,
        title: "Updated Without Tags",
        content: "Updated content",
        category: "Lifestyle",
        tags: [],
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date(),
      };

      categoryService.createIfNotExists.mock.mockImplementation(() =>
        Promise.resolve(mockCategory)
      );

      mockRepository.update.mock.mockImplementation(() =>
        Promise.resolve(updateResult)
      );

      mockRepository.get.mock.mockImplementation(() =>
        Promise.resolve(updatedPost)
      );

      const response = await service.update(postId, updateData);

      // Verify tags services were NOT called
      assert.strictEqual(tagService.createIfNotExists.mock.calls.length, 0);
      assert.strictEqual(postTagService.createIfNotExists.mock.calls.length, 0);

      // Verify response
      assert.strictEqual(response.id, 2);
      assert.strictEqual(response.tags.length, 0);
    });

    test("should handle update errors gracefully", async () => {
      const postId = "1";
      const updateData = {
        title: "Will Fail",
        content: "This will throw error",
        category: "Tech",
        tags: [],
      };

      categoryService.createIfNotExists.mock.mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await service.update(postId, updateData);

      // Verify error is caught and undefined is returned
      assert.strictEqual(response, undefined);
    });
  });

  describe("delete", () => {
    test("should delete an existing post", async () => {
      const postId = "1";

      mockRepository.delete.mock.mockImplementation(() =>
        Promise.resolve(true)
      );

      const response = await service.delete(postId);

      // Verify repository delete was called
      assert.strictEqual(mockRepository.delete.mock.calls.length, 1);
      assert.strictEqual(
        mockRepository.delete.mock.calls[0].arguments[0],
        postId
      );

      // Verify response
      assert.strictEqual(response, true);
    });

    test("should return false when deleting non-existent post", async () => {
      const postId = "999";

      mockRepository.delete.mock.mockImplementation(() =>
        Promise.resolve(false)
      );

      const response = await service.delete(postId);

      // Verify repository delete was called
      assert.strictEqual(mockRepository.delete.mock.calls.length, 1);
      assert.strictEqual(
        mockRepository.delete.mock.calls[0].arguments[0],
        postId
      );

      // Verify response
      assert.strictEqual(response, false);
    });

    test("should handle deletion of post with complex data", async () => {
      const postId = "42";

      mockRepository.delete.mock.mockImplementation(() =>
        Promise.resolve(true)
      );

      const response = await service.delete(postId);

      // Verify repository delete was called with correct ID
      assert.strictEqual(
        mockRepository.delete.mock.calls[0].arguments[0],
        "42"
      );

      // Verify successful deletion
      assert.strictEqual(response, true);
    });
  });
});
