import { AppDataSource } from "#configs/data-source";
import { UserSchema } from "#entity/user";

export const UserRepository = AppDataSource.getRepository(UserSchema).extend({
  /**
   *
   * @param {string} id
   * @returns {Promise<IUser>}
   */
  getUserById: async function (id) {
    return await this.findOne({ where: { id } });
  },

  /**
   *
   * @param {string} email
   * @returns {Promise<IUser>}
   */
  getUserByEmail: async function (email) {
    return await this.findOne({ where: { email } });
  },

  /**
   *
   * @param {string} email
   * @param {string} phone
   * @returns {Promise<boolean>}
   */
  checkUserExistence: async function (email, phone) {
    if (!email && !phone) {
      return false;
    }

    // Use the OR operator by passing an array of conditions to existsBy
    const userExists = await this.existsBy([
      { email: email },
      { phone: phone },
    ]);

    return userExists;
  },

  /**
   *
   * @param {UserRegisterPayLoad} user
   */
  createUser: async function (user) {
    return await this.save(user);
  },
});
