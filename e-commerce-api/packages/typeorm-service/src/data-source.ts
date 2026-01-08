import 'reflect-metadata'
import { DataSource } from 'typeorm'

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [__dirname + '/entity/*.js'],
  migrations: [__dirname + '/migrations/*.js'],
  subscribers: [],
})
