import "dotenv/config";
import {
  createMysqlDataSource,
  createPostgresDataSource,
} from "./create-data-source";

export const AppDataSource = createPostgresDataSource();
