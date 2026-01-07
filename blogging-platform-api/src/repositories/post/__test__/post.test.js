import assert from "node:assert/strict";
import { test, describe, beforeEach, mock } from "node:test";

import { PostRepository } from "../index.js";
import { Post } from "#models/post";

describe("PostRepository", () => {
  let mockDb;
  let repository;

  // Reset mocks before each test
  beforeEach(() => {
    mockDb = {
      all: mock.fn(),
      get: mock.fn(),
      run: mock.fn(),
    };

    repository = new PostRepository(mockDb);
  });

  describe("getAll", () => {
    test("should return all posts without search term", async () => {
      const mockDbPosts = [
        {
          id: 1,
          title: "First Post",
          content: "Content 1",
          category: "Technology",
          tags: JSON.stringify(["tech", "coding"]),
          created_at: "2025-01-01T10:00:00Z",
          updated_at: "2025-01-01T10:00:00Z",
        },
        {
          id: 2,
          title: "Second Post",
          content: "Content 2",
          category: "Lifestyle",
          tags: JSON.stringify(["life", "health"]),
          created_at: "2025-01-02T10:00:00Z",
          updated_at: "2025-01-02T10:00:00Z",
        },
      ];

      mockDb.all.mock.mockImplementation(() => Promise.resolve(mockDbPosts));

      const result = await repository.getAll();

      // Verify database query was called
      assert.strictEqual(mockDb.all.mock.calls.length, 1);

      // Verify the query doesn't include search WHERE clause
      const query = mockDb.all.mock.calls[0].arguments[0];
      assert.ok(!query.includes("WHERE"));
      assert.ok(query.includes("ORDER BY p.updated_at DESC"));

      // Verify result is array of Post instances
      assert.strictEqual(result.length, 2);
      assert.ok(result[0] instanceof Post);
      assert.ok(result[1] instanceof Post);

      // Verify Post data
      assert.strictEqual(result[0].id, 1);
      assert.strictEqual(result[0].title, "First Post");
      assert.strictEqual(result[0].category, "Technology");
      assert.deepStrictEqual(result[0].tags, ["tech", "coding"]);

      assert.strictEqual(result[1].id, 2);
      assert.strictEqual(result[1].title, "Second Post");
    });

    test("should return empty array when no posts exist", async () => {
      mockDb.all.mock.mockImplementation(() => Promise.resolve([]));

      const result = await repository.getAll();

      // Verify database query was called
      assert.strictEqual(mockDb.all.mock.calls.length, 1);

      // Verify result is empty array
      assert.deepStrictEqual(result, []);
    });

    test("should search posts by term in title", async () => {
      const searchTerm = "javascript";
      const mockDbPosts = [
        {
          id: 1,
          title: "Learning JavaScript",
          content: "A guide to JS",
          category: "Technology",
          tags: JSON.stringify(["javascript", "coding"]),
          created_at: "2025-01-01T10:00:00Z",
          updated_at: "2025-01-01T10:00:00Z",
        },
      ];

      mockDb.all.mock.mockImplementation(() => Promise.resolve(mockDbPosts));

      const result = await repository.getAll(searchTerm);

      // Verify database query was called with search parameters
      assert.strictEqual(mockDb.all.mock.calls.length, 1);

      // Verify the query includes search WHERE clause
      const query = mockDb.all.mock.calls[0].arguments[0];
      assert.ok(query.includes("WHERE"));
      assert.ok(query.includes("LOWER(ct.name) LIKE ?"));
      assert.ok(query.includes("LOWER(p.title) LIKE ?"));
      assert.ok(query.includes("LOWER(p.content) LIKE ?"));

      // Verify search term is lowercased and wrapped with wildcards
      const queryArgs = mockDb.all.mock.calls[0].arguments.slice(1);
      assert.strictEqual(queryArgs.length, 3);
      assert.strictEqual(queryArgs[0], `%${searchTerm.toLowerCase()}%`);
      assert.strictEqual(queryArgs[1], `%${searchTerm.toLowerCase()}%`);
      assert.strictEqual(queryArgs[2], `%${searchTerm.toLowerCase()}%`);

      // Verify filtered results
      assert.strictEqual(result.length, 1);
      assert.ok(result[0] instanceof Post);
      assert.strictEqual(result[0].title, "Learning JavaScript");
    });

    test("should search posts by term in content", async () => {
      const searchTerm = "guide";
      const mockDbPosts = [
        {
          id: 2,
          title: "Complete Tutorial",
          content: "This is a comprehensive guide",
          category: "Education",
          tags: JSON.stringify(["tutorial"]),
          created_at: "2025-01-01T10:00:00Z",
          updated_at: "2025-01-01T10:00:00Z",
        },
      ];

      mockDb.all.mock.mockImplementation(() => Promise.resolve(mockDbPosts));

      const result = await repository.getAll(searchTerm);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].content, "This is a comprehensive guide");
    });

    test("should search posts by term in category", async () => {
      const searchTerm = "tech";
      const mockDbPosts = [
        {
          id: 1,
          title: "Tech Post",
          content: "About technology",
          category: "Technology",
          tags: JSON.stringify([]),
          created_at: "2025-01-01T10:00:00Z",
          updated_at: "2025-01-01T10:00:00Z",
        },
      ];

      mockDb.all.mock.mockImplementation(() => Promise.resolve(mockDbPosts));

      const result = await repository.getAll(searchTerm);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].category, "Technology");
    });

    test("should return empty array when search finds no matches", async () => {
      const searchTerm = "nonexistent";
      mockDb.all.mock.mockImplementation(() => Promise.resolve([]));

      const result = await repository.getAll(searchTerm);

      assert.strictEqual(mockDb.all.mock.calls.length, 1);
      assert.deepStrictEqual(result, []);
    });

    test("should handle case-insensitive search", async () => {
      const searchTerm = "JAVASCRIPT";
      const mockDbPosts = [
        {
          id: 1,
          title: "javascript basics",
          content: "Learn JS",
          category: "Tech",
          tags: JSON.stringify([]),
          created_at: "2025-01-01T10:00:00Z",
          updated_at: "2025-01-01T10:00:00Z",
        },
      ];

      mockDb.all.mock.mockImplementation(() => Promise.resolve(mockDbPosts));

      const result = await repository.getAll(searchTerm);

      // Verify search term is converted to lowercase
      const queryArgs = mockDb.all.mock.calls[0].arguments.slice(1);
      assert.strictEqual(queryArgs[0], "%javascript%");

      assert.strictEqual(result.length, 1);
    });
  });

  describe("get", () => {
    test("should return a post by ID", async () => {
      const postId = 1;
      const mockDbPost = {
        id: 1,
        title: "Test Post",
        content: "Test Content",
        category: "Technology",
        tags: JSON.stringify(["test", "coding"]),
        created_at: "2025-01-01T10:00:00Z",
        updated_at: "2025-01-01T10:00:00Z",
      };

      mockDb.get.mock.mockImplementation(() => Promise.resolve(mockDbPost));

      const result = await repository.get(postId);

      // Verify database query was called
      assert.strictEqual(mockDb.get.mock.calls.length, 1);

      // Verify query includes WHERE clause with named parameter
      const query = mockDb.get.mock.calls[0].arguments[0];
      assert.ok(query.includes("WHERE p.id = :id"));

      // Verify named parameter was passed
      const params = mockDb.get.mock.calls[0].arguments[1];
      assert.deepStrictEqual(params, { ":id": postId });

      // Verify result is a Post instance
      assert.ok(result instanceof Post);
      assert.strictEqual(result.id, 1);
      assert.strictEqual(result.title, "Test Post");
      assert.strictEqual(result.content, "Test Content");
      assert.strictEqual(result.category, "Technology");
      assert.deepStrictEqual(result.tags, ["test", "coding"]);
    });

    test("should return null when post not found", async () => {
      const postId = 999;
      mockDb.get.mock.mockImplementation(() => Promise.resolve(null));

      const result = await repository.get(postId);

      // Verify database query was called
      assert.strictEqual(mockDb.get.mock.calls.length, 1);

      // Verify named parameter was passed
      const params = mockDb.get.mock.calls[0].arguments[1];
      assert.deepStrictEqual(params, { ":id": postId });

      // Verify result is null
      assert.strictEqual(result, null);
    });

    test("should handle post with no tags", async () => {
      const postId = 2;
      const mockDbPost = {
        id: 2,
        title: "No Tags Post",
        content: "Content without tags",
        category: "General",
        tags: JSON.stringify([]),
        created_at: "2025-01-01T10:00:00Z",
        updated_at: "2025-01-01T10:00:00Z",
      };

      mockDb.get.mock.mockImplementation(() => Promise.resolve(mockDbPost));

      const result = await repository.get(postId);

      assert.ok(result instanceof Post);
      assert.strictEqual(result.id, 2);
      assert.deepStrictEqual(result.tags, []);
    });

    test("should handle post with multiple tags", async () => {
      const postId = 3;
      const mockDbPost = {
        id: 3,
        title: "Multi Tag Post",
        content: "Post with many tags",
        category: "Tech",
        tags: JSON.stringify(["tag1", "tag2", "tag3", "tag4"]),
        created_at: "2025-01-01T10:00:00Z",
        updated_at: "2025-01-01T10:00:00Z",
      };

      mockDb.get.mock.mockImplementation(() => Promise.resolve(mockDbPost));

      const result = await repository.get(postId);

      assert.ok(result instanceof Post);
      assert.strictEqual(result.tags.length, 4);
      assert.deepStrictEqual(result.tags, ["tag1", "tag2", "tag3", "tag4"]);
    });

    test("should handle edge case ID (0)", async () => {
      const postId = 0;
      const mockDbPost = {
        id: 0,
        title: "Edge Case Post",
        content: "Post with ID 0",
        category: "Test",
        tags: JSON.stringify([]),
        created_at: "2025-01-01T10:00:00Z",
        updated_at: "2025-01-01T10:00:00Z",
      };

      mockDb.get.mock.mockImplementation(() => Promise.resolve(mockDbPost));

      const result = await repository.get(postId);

      const params = mockDb.get.mock.calls[0].arguments[1];
      assert.deepStrictEqual(params, { ":id": 0 });

      assert.ok(result instanceof Post);
      assert.strictEqual(result.id, 0);
    });
  });

  describe("create", () => {
    test("should create a new post", async () => {
      const newPostData = {
        title: "New Post",
        content: "New Content",
        category: 1, // Category ID
      };

      const mockResult = {
        lastID: 5,
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.create(newPostData);

      // Verify database run was called
      assert.strictEqual(mockDb.run.mock.calls.length, 1);

      // Verify INSERT query
      const query = mockDb.run.mock.calls[0].arguments[0];
      assert.ok(query.includes("INSERT INTO"));
      assert.ok(query.includes("(title,categoryId,content)"));
      assert.ok(query.includes("VALUES (?,?,?)"));

      // Verify parameters order: title, category, content
      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[0], "New Post"); // title
      assert.strictEqual(params[1], 1); // categoryId
      assert.strictEqual(params[2], "New Content"); // content

      // Verify result contains lastID
      assert.strictEqual(result.lastID, 5);
      assert.strictEqual(result.changes, 1);
    });

    test("should create post with different category ID", async () => {
      const newPostData = {
        title: "Tech Article",
        content: "Technical content",
        category: 99,
      };

      const mockResult = {
        lastID: 10,
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.create(newPostData);

      // Verify category ID was passed correctly
      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[1], 99);

      assert.strictEqual(result.lastID, 10);
    });

    test("should handle long content", async () => {
      const longContent = "A".repeat(10000);
      const newPostData = {
        title: "Long Post",
        content: longContent,
        category: 1,
      };

      const mockResult = {
        lastID: 7,
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.create(newPostData);

      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[2].length, 10000);

      assert.strictEqual(result.lastID, 7);
    });

    test("should handle special characters in title and content", async () => {
      const newPostData = {
        title: "Post with 'quotes' and \"double quotes\"",
        content: "Content with <html> & special chars: @#$%",
        category: 2,
      };

      const mockResult = {
        lastID: 8,
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.create(newPostData);

      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[0], "Post with 'quotes' and \"double quotes\"");
      assert.strictEqual(
        params[2],
        "Content with <html> & special chars: @#$%"
      );

      assert.strictEqual(result.lastID, 8);
    });
  });

  describe("update", () => {
    test("should update an existing post", async () => {
      const postId = 1;
      const updateData = {
        title: "Updated Title",
        content: "Updated Content",
        category: 2,
      };

      const mockResult = {
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.update(postId, updateData);

      // Verify database run was called
      assert.strictEqual(mockDb.run.mock.calls.length, 1);

      // Verify UPDATE query
      const query = mockDb.run.mock.calls[0].arguments[0];
      assert.ok(query.includes("UPDATE"));
      assert.ok(
        query.includes(
          "SET title = ?, categoryId = ?, content = ?, updated_at = CURRENT_TIMESTAMP"
        )
      );
      assert.ok(query.includes("WHERE id = ?"));

      // Verify parameters order: title, category, content, id
      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[0], "Updated Title"); // title
      assert.strictEqual(params[1], 2); // categoryId
      assert.strictEqual(params[2], "Updated Content"); // content
      assert.strictEqual(params[3], 1); // id

      // Verify result
      assert.strictEqual(result.changes, 1);
    });

    test("should return 0 changes when updating non-existent post", async () => {
      const postId = 999;
      const updateData = {
        title: "Updated Title",
        content: "Updated Content",
        category: 1,
      };

      const mockResult = {
        changes: 0,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.update(postId, updateData);

      // Verify database run was called
      assert.strictEqual(mockDb.run.mock.calls.length, 1);

      // Verify ID was passed
      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[3], 999);

      // Verify result shows no changes
      assert.strictEqual(result.changes, 0);
    });

    test("should update only title", async () => {
      const postId = 5;
      const updateData = {
        title: "New Title Only",
        content: "Original content",
        category: 1,
      };

      const mockResult = {
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.update(postId, updateData);

      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[0], "New Title Only");

      assert.strictEqual(result.changes, 1);
    });

    test("should update category", async () => {
      const postId = 3;
      const updateData = {
        title: "Same Title",
        content: "Same Content",
        category: 99,
      };

      const mockResult = {
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.update(postId, updateData);

      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[1], 99); // categoryId

      assert.strictEqual(result.changes, 1);
    });

    test("should handle special characters in updated content", async () => {
      const postId = 2;
      const updateData = {
        title: "Update with 'quotes'",
        content: "Updated <html> & symbols: @#$%",
        category: 1,
      };

      const mockResult = {
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.update(postId, updateData);

      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[0], "Update with 'quotes'");
      assert.strictEqual(params[2], "Updated <html> & symbols: @#$%");

      assert.strictEqual(result.changes, 1);
    });

    test("should update timestamp automatically", async () => {
      const postId = 1;
      const updateData = {
        title: "Updated",
        content: "Updated",
        category: 1,
      };

      const mockResult = {
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      await repository.update(postId, updateData);

      // Verify query includes CURRENT_TIMESTAMP for updated_at
      const query = mockDb.run.mock.calls[0].arguments[0];
      assert.ok(query.includes("updated_at = CURRENT_TIMESTAMP"));
    });
  });

  describe("delete", () => {
    test("should delete an existing post", async () => {
      const postId = 1;
      const mockResult = {
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.delete(postId);

      // Verify database run was called
      assert.strictEqual(mockDb.run.mock.calls.length, 1);

      // Verify DELETE query
      const query = mockDb.run.mock.calls[0].arguments[0];
      assert.ok(query.includes("DELETE FROM"));
      assert.ok(query.includes("WHERE id = ?"));

      // Verify ID parameter
      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[0], 1);

      // Verify result is true (!!1)
      assert.strictEqual(result, true);
    });

    test("should return false when deleting non-existent post", async () => {
      const postId = 999;
      const mockResult = {
        changes: 0,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.delete(postId);

      // Verify database run was called
      assert.strictEqual(mockDb.run.mock.calls.length, 1);

      // Verify ID parameter
      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[0], 999);

      // Verify result is false (!!0)
      assert.strictEqual(result, false);
    });

    test("should handle edge case ID (0)", async () => {
      const postId = 0;
      const mockResult = {
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.delete(postId);

      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[0], 0);

      assert.strictEqual(result, true);
    });

    test("should handle string ID", async () => {
      const postId = "42";
      const mockResult = {
        changes: 1,
      };

      mockDb.run.mock.mockImplementation(() => Promise.resolve(mockResult));

      const result = await repository.delete(postId);

      const params = mockDb.run.mock.calls[0].arguments.slice(1);
      assert.strictEqual(params[0], "42");

      assert.strictEqual(result, true);
    });

    test("should return false when database result is null", async () => {
      const postId = 1;
      mockDb.run.mock.mockImplementation(() => Promise.resolve(null));

      const result = await repository.delete(postId);

      // Verify result is false (!!null?.changes)
      assert.strictEqual(result, false);
    });

    test("should return false when database result is undefined", async () => {
      const postId = 1;
      mockDb.run.mock.mockImplementation(() => Promise.resolve(undefined));

      const result = await repository.delete(postId);

      // Verify result is false (!!undefined?.changes)
      assert.strictEqual(result, false);
    });
  });
});
