import { Message } from "types/message";
import prisma from "../lib/prisma";

export const createMessage = async (data: Message) => {
  return await prisma.message.create({ data });
};

export const getAllMessages = async () => {
  return await prisma.message.findMany({ orderBy: { id: "desc" } });
};

export const findMessageById = async (id: string) => {
  return await prisma.message.findUnique({ where: { id } });
};
