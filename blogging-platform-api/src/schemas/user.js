import { Schema } from "effect";

const emailRegex = /^[^@]+@[^@]+.[^@]+$/;

export const UserLoginSchemaStruct = Schema.Struct({
  email: Schema.String.pipe(
    Schema.filter((s) => emailRegex.test(s) || "must be a valid email", {
      jsonSchema: { format: "email" },
    })
  ),
  password: Schema.String,
});

export const UserRegisterSchemaStruct = Schema.Struct({
  email: Schema.String.pipe(
    Schema.filter((s) => emailRegex.test(s) || "must be a valid email", {
      jsonSchema: { format: "email" },
    })
  ),
  password: Schema.String,
  firstName: Schema.String.pipe(Schema.minLength(2)),
  lastName: Schema.optional(Schema.String.pipe(Schema.minLength(2))),
  phone: Schema.String.pipe(Schema.minLength(9), Schema.maxLength(12)),
});
