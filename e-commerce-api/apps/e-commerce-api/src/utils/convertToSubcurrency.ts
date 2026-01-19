export const convertToSubcurrency = (amount: number, factor = 100) =>
  Math.round(amount * factor);
