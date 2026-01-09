export const UserCreatedMinimalJsonSchema = {
  type: "object",
  required: ["data", "type"],

  additionalProperties: true, // 👈 allow root extras

  properties: {
    data: {
      type: "object",

      required: [
        "email_addresses",
        "first_name",
        "id",
        "image_url",
        "last_name",
        "object",
        "phone_numbers",
        "username",
        "created_at",
        "updated_at",
      ],

      additionalProperties: true, // 👈 allow extra user fields

      properties: {
        email_addresses: {
          type: "array",
          items: {
            type: "object",
            required: ["email_address"],
            additionalProperties: true, // 👈 allow email extras
            properties: {
              email_address: {
                type: "string",
                pattern: "^[^@]+@[^@]+\\.[^@]+$",
              },
            },
          },
        },

        first_name: { type: "string" },
        id: { type: "string" },
        image_url: { type: "string" },
        last_name: { type: "string" },

        created_at: { type: "number" },
        updated_at: { type: "number" },

        object: { const: "user" },

        phone_numbers: {
          type: "array",
          items: {
            type: "object",
            required: ["phone_number"],
            additionalProperties: true,
            properties: {
              phone_number: {
                type: "string",
                pattern: "^(\\+?\\d{1,3})?0?\\d{9}$",
              },
            },
          },
        },

        username: { type: "string" },
      },
    },

    type: { const: "user.created" },
  },
} as const;
