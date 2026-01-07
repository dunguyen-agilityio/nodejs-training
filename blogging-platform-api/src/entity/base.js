export const BaseColumnSchemaPart = {
  id: {
    type: "int",
    primary: true,
    generated: true,
  },
  createdAt: {
    name: "created_at",
    type: "datetime",
    createDate: true,
    default: () => "CURRENT_TIMESTAMP",
  },
  updatedAt: {
    name: "updated_at",
    type: "datetime",
    updateDate: true,
    default: () => "CURRENT_TIMESTAMP",
  },
};
