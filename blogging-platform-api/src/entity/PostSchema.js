import { EntitySchema } from "typeorm";

export const PostSchema = new EntitySchema({
  name: "Post",
  tableName: "posts",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    title: {
      type: "varchar",
    },
    content: {
      type: "nvarchar",
      length: 225,
    },
    createdAt: {
      name: "created_at",
      type: "datetime",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      name: "updated_at",
      type: "datetime",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    category: {
      type: "many-to-one",
      target: "Category",
      joinTable: true,
    },
    tags: {
      type: "many-to-many",
      target: "Tag",
      joinTable: true,
    },
  },
});
