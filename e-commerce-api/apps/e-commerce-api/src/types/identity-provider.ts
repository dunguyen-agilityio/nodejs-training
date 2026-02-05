export interface LoginResult {
  status: string
  sid?: string | null
  [key: string]: any
}

export interface IIdentityProvider {
  login(identifier: string, password: string): Promise<LoginResult>
}
