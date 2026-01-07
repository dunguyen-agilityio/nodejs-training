import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import * as fs from "node:fs";
import { AuthService } from "#services/auth";

/**
 *
 * @param {IUserService} userService
 * @param {IAuthService} authService
 * @returns
 */
export const initialize = (userService, authService) => {
  const publicKey = fs.readFileSync("./public.key", "utf8");

  passport.use(
    new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: publicKey,
        algorithms: [process.env.ACCESS_TOKEN_ALGORITHM],
        passReqToCallback: true,
      },
      async function (req, jwt_payload, done) {
        const jwt = req.headers.authorization.split(" ")[1];

        if (!jwt_payload || !authService.isLogined(jwt)) {
          done(null, false);
        } else {
          const result = await userService.getUserById(jwt_payload.id);

          if (!result || !result.data) {
            done(null, false);
          } else {
            req.user = result.data;
            done(null, result.data);
          }
        }
      }
    )
  );

  return passport.initialize();
};

export const authenticate = () => {
  return passport.authenticate("jwt", { session: false });
};
