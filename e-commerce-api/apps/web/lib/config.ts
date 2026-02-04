const requiredEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const config = {
  api: {
    endpoint: requiredEnv('NEXT_PUBLIC_API_ENDPOINT'),
  },

  clerk: {
    tokenTemplate: requiredEnv('NEXT_PUBLIC_CLERK_TOKEN_TEMPLATE'),
  },

  stripe: {
    publicKey: requiredEnv('NEXT_PUBLIC_STRIPE_PUBLIC_KEY'),
  },

  app: {
    baseUrl: requiredEnv('NEXT_PUBLIC_BASE_URL'),
  },

  isDevelopment: process.env.NODE_ENV === 'development',
} as const
