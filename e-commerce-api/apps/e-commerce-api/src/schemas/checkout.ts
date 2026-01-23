export const createPaymentIntentSchema = {
  type: "object",
  required: ["amount", "currency"],
  additionalProperties: true,
  properties: {
    amount: { type: "string", pattern: "^[0-9]+$" },
    currency: { type: "string", pattern: "^[a-z]{3}$", default: "usd" },
  },
} as const;

export const checkoutSuccessSchema = {
  type: "object",
  required: ["data", "type"],
  additionalProperties: true,
  properties: {
    data: {
      type: "object",
      required: ["object"],
      additionalProperties: true,
      properties: {
        object: {
          type: "object",
          required: ["id", "customer", "customer_account"],
          additionalProperties: true,
          properties: {
            id: { type: "string" },
            customer: { type: "string" },
            customer_account: { type: "string" },
          },
        },
      },
    },
    type: { type: "string", enum: ["payment_intent.succeeded"] },
  },
} as const;
