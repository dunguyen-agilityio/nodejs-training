import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "data/database.sqlite",
  synchronize: false,
  logging: false,
  entities: ["src/entity/*.js"],
  migrations: ["src/seeds/*.js"],
  subscribers: [],
});
