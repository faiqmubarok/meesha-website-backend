import { Message } from "../types/message";
import {
  createMessage,
  getAllMessages,
  findMessageById,
} from "./message.repository";

const createMessageService = async (data: Message) => {
  return await createMessage(data);
};

const getAllMessagesService = async () => {
  return await getAllMessages();
};

const getMessageByIdService = async (id: string) => {
  const message = await findMessageById(id);
  if (!message) throw new Error("Message not found");
  return message;
};

export default {
  createMessageService,
  getAllMessagesService,
  getMessageByIdService,
};
