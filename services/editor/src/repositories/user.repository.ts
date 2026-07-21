import { User } from "../models/user.model.js";
import type { UserType } from "@cotex/shared-types";

class UserRepository {
  public async createUser({
    email,
    name,
    password,
  }: {
    email: string;
    name: string;
    password: string;
  }): Promise<UserType> {
    const user = await User.create({
      email,
      name,
      password,
    });

    return user;
  }

  public async findByEmail(email: string): Promise<UserType | null> {
    return await User.findOne({ email });
  }

  public findById = async (id: string): Promise<UserType | null> => {
    return await User.findById(id);
  };
}

export { UserRepository };
