import 'reflect-metadata'

import { DataSource, DataSourceOptions } from 'typeorm'

import { env } from '#configs/env'

import * as Entities from '#entities'

export const createPostgresDataSource = (
  options?: Omit<DataSourceOptions, 'type' | 'database' | 'poolSize'>,
) =>
  new DataSource({
    type: 'postgres',
    host: env.database.host,
    port: env.database.port,
    username: env.database.username,
    password: env.database.password,
    database: env.database.name,
    synchronize: true,
    logging: false,
    entities: Object.values(Entities),
    migrations: ['src/database/migrations/*{.js,.ts}'],
    subscribers: [],
    ...options,
  } as DataSourceOptions)
