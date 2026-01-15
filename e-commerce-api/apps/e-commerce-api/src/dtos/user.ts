import { User } from "#entities";
import { USER_ROLES } from "#types/user";
import { UserJSON } from "@clerk/fastify";

export const transformatFromClerk = (user: UserJSON) => {
  const {
    email_addresses,
    first_name: firstName,
    id,
    image_url,
    last_name: lastName,
    username,
    created_at: createdAt,
    updated_at: updatedAt,
    phone_numbers,
    role,
  } = user;

  const newUser = new User({
    avatar: image_url,
    lastName: lastName ?? "",
    id,
    username: username ?? "",
    firstName: firstName ?? "firstName",
    email: email_addresses[0]?.email_address || "",
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    phone: phone_numbers[0]?.phone_number,
    role: role as USER_ROLES,
  });

  return newUser;
};
