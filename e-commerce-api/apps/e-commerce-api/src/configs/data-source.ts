import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";

export const createDataSource = (
  options?: Omit<DataSourceOptions, "type" | "database" | "poolSize">
) =>
  new DataSource({
    type: "better-sqlite3",
    database: "database.sqlite",
    synchronize: false,
    logging: false,
    entities: ["src/entities/*{.js,.ts}"],
    migrations: ["src/migrations/*{.js,.ts}"],
    subscribers: [],
    ...options,
  });

export const AppDataSource = createDataSource();
