import { EntitySchema } from "typeorm";

export const TagSchema = new EntitySchema({
  name: "Tag",
  tableName: "tags",
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
      type: "many-to-many",
      joinTable: true,
    },
  },
});
