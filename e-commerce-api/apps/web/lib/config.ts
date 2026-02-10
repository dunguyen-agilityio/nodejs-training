export const config = {
  api: {
    endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || '',
  },

  clerk: {
    tokenTemplate: process.env.NEXT_PUBLIC_CLERK_TOKEN_TEMPLATE || '',
  },

  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
  },

  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
  },

  isDevelopment: process.env.NODE_ENV === 'development',
} as const

// Validation check for debugging
if (typeof window !== 'undefined' && !config.api.endpoint) {
  console.error('Missing NEXT_PUBLIC_API_ENDPOINT')
}
