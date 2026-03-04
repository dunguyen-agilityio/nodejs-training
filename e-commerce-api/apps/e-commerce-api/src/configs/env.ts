export const env = {
  // Database
  database: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    name: process.env.POSTGRES_NAME,
  },

  // Email Service
  mail: {
    apiKey: process.env.SENDGRID_API_KEY!,
    fromEmail: process.env.SENDGRID_FROM_EMAIL!,
    supportEmail: process.env.SENDGRID_SUPPORT_EMAIL!,
    templates: {
      registerSuccess: process.env.SENDGRID_TEMPLATE_REGISTER_SUCCESS!,
      orderSuccess: process.env.SENDGRID_TEMPLATE_ORDER_SUCCESS!,
      invoice: process.env.SENDGRID_TEMPLATE_INVOICE!,
    },
  },

  // Stripe Payment
  stripe: {
    secretKey: process.env.STRIPE_API_KEY!,
  },

  // Application Settings
  app: {
    name: process.env.APP_NAME!,
    logoUrl: process.env.APP_LOGO_URL!,
    year: process.env.APP_YEAR!,
  },

  // Client/Frontend URLs
  client: {
    baseUrl: process.env.CLIENT_BASE_URL!,
    loginPath: process.env.CLIENT_LOGIN_PATH!,
    tokenTemplate: process.env.CLERK_TOKEN_TEMPLATE!,
  },

  // Environment
  nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test',
} as const

export default env
