export type CreateSignInTokensParams = {
  userId: string
  expiresInSeconds: number
}

export type VerifyPasswordParams = {
  userId: string
  password: string
}

export type LoginParams = {
  identifier: string
  password: string
}
