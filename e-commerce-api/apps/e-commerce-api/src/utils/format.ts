import { PaymentMethod, PaymentMethodType } from "#types/invoice";

/**
 * Format Stripe amount (in smallest unit) to currency string
 * Example: (2000, "usd") -> "$20.00"
 */
export function formatStripeAmount(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function formatAmount(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Format Stripe Unix timestamp (seconds) to date
 * Example: 1769497884 -> "January 21, 2026"
 */
export function formatStripeDate(
  unixSeconds: number,
  locale = "en-US",
): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(unixSeconds * 1000));
}

export const formatPaymentMethod = (
  type: PaymentMethodType,
  paymentMethod: PaymentMethod,
) => {
  if (!paymentMethod[type]) return "";

  switch (type) {
    case "card":
      return `${paymentMethod[type].brand.toUpperCase()} •••• ${paymentMethod[type].last4}`;

    case "link":
      return `Link ${paymentMethod[type].email}`;

    default:
      return "";
  }
};
