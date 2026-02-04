import { DataSource, DataSourceOptions } from 'typeorm'

import 'reflect-metadata'

export const createDataSource = (
  options?: Omit<DataSourceOptions, 'type' | 'database' | 'poolSize'>,
) =>
  new DataSource({
    type: 'better-sqlite3',
    database: 'database.sqlite',
    synchronize: false,
    logging: false,
    entities: ['../entities/*{.js,.ts}'],
    migrations: ['../migrations/*{.js,.ts}'],
    subscribers: [],
    ...options,
  })

export const AppDataSource = createDataSource()
