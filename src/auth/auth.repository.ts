import { User } from "../types/user";
import prisma from "../lib/prisma";

export const createUser = async (userData: User) => {
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role,
    },
  });

  return user;
};

export const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
};

export default {
  createUser,
  findUserByEmail,
};
