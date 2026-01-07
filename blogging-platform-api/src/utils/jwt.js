import jwt from "jsonwebtoken";
import * as fs from "node:fs";

export const gennerateJwt = (data) => {
  const privateKey = fs.readFileSync("./private.key", "utf8");

  const token = jwt.sign(data, privateKey, {
    expiresIn: `${process.env.ACCESS_TOKEN_EXPIRESIN || 1}DAYS`,
    algorithm: process.env.ACCESS_TOKEN_ALGORITHM,
  });

  return token;
};
