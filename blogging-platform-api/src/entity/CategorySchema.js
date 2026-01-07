import { Category } from "#models/category";
import { EntitySchema } from "typeorm";

export const CategorySchema = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      unique: true,
    },
  },
  relations: {
    posts: {
      target: "Post",
      type: "one-to-many",
      joinTable: true,
    },
  },
});
