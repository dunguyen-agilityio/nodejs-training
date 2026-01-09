import { createAppDataSource } from "@repo/typeorm-service";

export const AppDataSource = createAppDataSource({
  migrations: ["src/migrations/*{.js,.ts}"],
});
