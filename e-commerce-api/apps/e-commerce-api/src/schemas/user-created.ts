export const UserCreatedMinimalJsonSchema = {
  type: "object",
  required: ["data", "type", "object"],

  additionalProperties: true,

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

      additionalProperties: true,

      properties: {
        email_addresses: {
          type: "array",
          items: {
            type: "object",
            required: ["email_address"],
            additionalProperties: true,
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
        role: {
          type: "string",
          description: "The role of the user.",
          enum: ["ADMIN", "USER"],
        },

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
    object: { const: "event" },
  },
} as const;

export const organizationMembershipCreatedJsonSchema = {
  type: "object",
  required: ["data", "type"],
  additionalProperties: true,
  properties: {
    data: {
      type: "object",
      required: ["role_name", "public_user_data"],
      additionalProperties: true,
      properties: {
        public_user_data: {
          type: "object",
          additionalProperties: true,
          required: ["user_id"],
          properties: {
            user_id: { type: "string" },
          },
        },
        role_name: {
          type: "string",
          description: "The role of the user.",
          enum: ["Admin", "User"],
        },
      },
    },

    type: { const: "organizationMembership.created" },
  },
} as const;
