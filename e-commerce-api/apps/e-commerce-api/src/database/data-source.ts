import 'dotenv/config'

import { createPostgresDataSource } from './create-data-source'

export const AppDataSource = createPostgresDataSource()
