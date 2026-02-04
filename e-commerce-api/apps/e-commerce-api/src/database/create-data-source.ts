import { DataSource, DataSourceOptions } from 'typeorm'

import 'reflect-metadata'

export const createPostgresDataSource = (
  options?: Omit<DataSourceOptions, 'type' | 'database' | 'poolSize'>,
) =>
  new DataSource({
    type: process.env.DATABASE_TYPE || 'sqlite',
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: false,
    logging: false,
    entities: ['src/database/entities/*{.js,.ts}'],
    migrations: ['src/database/migrations/*{.js,.ts}'],
    subscribers: [],
    ...options,
  } as DataSourceOptions)
