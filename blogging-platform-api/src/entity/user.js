import { EntitySchema } from "typeorm";
import { BaseColumnSchemaPart } from "./base.js";

export const UserSchema = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    email: {
      type: "varchar",
      unique: true,
    },
    firstName: { type: "varchar" },
    phone: { type: "varchar", unique: true, nullable: true },
    verified: { type: "boolean", default: false },
    lastName: { type: "varchar", nullable: true },
    password: { type: "varchar" },
    dateOfBirth: { type: "date", nullable: true },
    address: { type: "varchar", nullable: true },
    role: { type: "int", default: 0 },
    ...BaseColumnSchemaPart,
  },
});
