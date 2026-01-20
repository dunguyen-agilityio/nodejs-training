import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";

export const createDataSource = (
  options?: Omit<DataSourceOptions, "type" | "database" | "poolSize">,
) =>
  new DataSource({
    type: "better-sqlite3",
    database: "src/database/database.sqlite",
    synchronize: false,
    logging: false,
    entities: ["src/database/entities/*{.js,.ts}"],
    migrations: ["src/database/migrations/*{.js,.ts}"],
    subscribers: [],
    ...options,
  });
