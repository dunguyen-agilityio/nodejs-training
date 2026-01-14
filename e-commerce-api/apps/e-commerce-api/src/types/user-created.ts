import { FromSchema } from "json-schema-to-ts";
import { UserCreatedMinimalJsonSchema } from "../schemas/user-created";

export type UserCreatedMinimal = FromSchema<
  typeof UserCreatedMinimalJsonSchema
>;
