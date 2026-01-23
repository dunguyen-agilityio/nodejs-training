export type CreateSignInTokensParams = {
  userId: string;
  expiresInSeconds: number;
};

export type VerifyPasswordParams = {
  userId: string;
  password: string;
};

export type AuthClient = {
  users: {
    verifyPassword: (
      params: VerifyPasswordParams,
    ) => Promise<{ verified: boolean }>;
  };
  signInTokens: {
    createSignInToken: (
      params: CreateSignInTokensParams,
    ) => Promise<{ token: string }>;
  };
};

export type LoginParams = {
  identifier: string;
  password: string;
};
