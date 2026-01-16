export const uncapitalize = (str: string) =>
  typeof str === "string" && str.length
    ? str.charAt(0).toLowerCase() + str.slice(1)
    : str;
