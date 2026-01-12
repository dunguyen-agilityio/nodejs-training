import 'reflect-metadata'
import { DataSource, DataSourceOptions } from 'typeorm'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const createAppDataSource = (
  options?: Partial<Omit<DataSourceOptions, 'type' | 'database' | 'poolSize'>>,
) =>
  new DataSource({
    type: 'better-sqlite3',
    database: 'database.sqlite',
    synchronize: false,
    logging: false,
    entities: [__dirname + '/entity/*{.js,.ts}'],
    migrations: [__dirname + '/migrations/*{.js,.ts}'],
    subscribers: [],
    ...options,
  })
