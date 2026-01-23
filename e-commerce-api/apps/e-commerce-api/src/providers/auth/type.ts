import { AuthClient } from "#types/auth";

export abstract class AbstractAuthProvider {
  constructor(protected authClient: AuthClient) { }

  abstract login(identifier: string, password: string): Promise<string>;
}
