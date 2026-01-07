export class User {
  /**
   * @param {IUser} user
   */
  constructor({
    firstName,
    id,
    lastName,
    password,
    email,
    address,
    avatar,
    dateOfBirth,
    role,
    createdAt,
    updatedAt,
    phone,
    verified,
  }) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.dateOfBirth = new Date(dateOfBirth);
    this.address = address;
    this.avatar = avatar;
    this.role = role;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
    this.phone = phone;
    this.verified = verified;
  }

  get profile() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth.toISOString(),
      address: this.address,
      avatar: this.avatar,
      role: this.role,
      phone: this.phone,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      verified: this.verified,
      email: this.email,
    };
  }
}
