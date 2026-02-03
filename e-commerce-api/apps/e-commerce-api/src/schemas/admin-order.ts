export const updateOrderStatusSchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["pending", "paid", "fulfilled", "completed"],
    },
  },
  required: ["status"],
} as const;
