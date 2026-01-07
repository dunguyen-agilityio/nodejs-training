import bcrypt from "bcrypt";
import { MOCK_TAGS, MOCK_CATEGORIES, MOCK_POSTS, MOCK_USERS } from "#mocks";

/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class SeedData1766634720557 {
  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    const categories = await Promise.all(
      MOCK_CATEGORIES.map(({ name }) =>
        queryRunner.query("INSERT INTO categories (name) VALUES (?)", name)
      )
    );

    await Promise.all(
      MOCK_USERS.map(
        ({
          address,
          dateOfBirth,
          email,
          firstName,
          lastName,
          password,
          role,
        }) => {
          const salt = bcrypt.genSaltSync();
          return queryRunner.query(
            "INSERT INTO users (email, firstName, lastName, password, dateOfBirth, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              email,
              firstName,
              lastName,
              bcrypt.hashSync(password, salt),
              dateOfBirth,
              address,
              role,
            ]
          );
        }
      )
    );

    const tags = await Promise.all(
      MOCK_TAGS.map((name) =>
        queryRunner.query("INSERT INTO tags (name) VALUES (?)", name)
      )
    );

    const posts = await Promise.all(
      MOCK_POSTS.map(({ title, content }) => {
        const categoryId = categories[Math.floor(Math.random() * 10)];
        return queryRunner.query(
          "INSERT INTO posts (title,categoryId,content) VALUES (?,?,?)",
          [title, categoryId, content]
        );
      })
    );

    await Promise.all(
      tags
        .map((tagId) =>
          posts.map((postId) =>
            queryRunner.query(
              "INSERT INTO posts_tags_tags (tagsId, postsId) VALUES (?,?)",
              [tagId, postId]
            )
          )
        )
        .flatMap((values) => [...values])
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query("DELETE FROM migrations");
    await queryRunner.query("DELETE FROM posts_tags_tags");
    await queryRunner.query("DELETE FROM posts");
    await queryRunner.query("DELETE FROM categories");
    await queryRunner.query("DELETE FROM tags");
    await queryRunner.query("DELETE FROM users");
  }
}
