import 'reflect-metadata'
import * as Entities from '#entities'
import { DataSource, DataSourceOptions } from 'typeorm'

import { env } from '#configs/env'

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
    synchronize: false,
    logging: false,
    entities: Object.values(Entities),
    migrations: ['src/database/migrations/*{.js,.ts}'],
    subscribers: [],
    ...options,
  } as DataSourceOptions)
