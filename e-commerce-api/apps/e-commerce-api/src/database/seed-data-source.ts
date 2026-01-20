import { createDataSource } from "./create-data-source";

export const SeedDataSource = createDataSource({
  migrations: ["src/database/seeds/*{.js,.ts}"],
});
