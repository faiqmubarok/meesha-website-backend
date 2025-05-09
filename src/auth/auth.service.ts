import { Role, User } from "../types/user";
import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "./auth.repository";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

const createUserService = async (userData: User) => {
  const existingUser = await findUserByEmail(userData.email);

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

  const userWithDefaults: User = {
    name: userData.name!,
    email: userData.email!,
    phone: userData.phone!,
    password: hashedPassword,
    role: userData.role ?? Role.USER,
  };

  const user = await createUser(userWithDefaults);
  return user;
};

export const loginUserService = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid email or password");

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) throw new Error("Invalid email or password");

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    photo_profile: user.photo_profile,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });

  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
};

export default {
  createUserService,
  loginUserService,
};
