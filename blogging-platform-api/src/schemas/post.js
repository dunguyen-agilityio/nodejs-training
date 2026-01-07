import { Schema } from "effect";

export const PostSchemaStruct = Schema.Struct({
  title: Schema.String,
  content: Schema.String,
  category: Schema.String,
  tags: Schema.Array(Schema.String),
});

export const PostQuerySchemaStruct = Schema.partialWith(
  Schema.Struct({
    term: Schema.String,
  }),
  { exact: true }
);
