import { AbstractAuthProvider } from "./type";

export class AuthProvider extends AbstractAuthProvider {
  async login(userId: string, password: string): Promise<string> {
    const { verified } = await this.authClient.users.verifyPassword({
      password,
      userId,
    });

    if (!verified) {
      throw new Error("Invalid password");
    }

    const { token } = await this.authClient.signInTokens.createSignInToken({
      userId,
      expiresInSeconds: 7 * 24 * 60 * 60, // 7 days,

    });

    return token;
  }
}
