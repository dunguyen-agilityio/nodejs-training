export const getClientEndpoint = (url: string) => {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api${url}`
}
