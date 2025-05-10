import express from "express";
import { Request, Response } from "express";
import messageService from "./message.service";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const message = await messageService.createMessageService(req.body);
    res
      .status(201)
      .json({ data: message, message: "Message created successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const messages = await messageService.getAllMessagesService();
    res.status(200).json({ data: messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const message = await messageService.getMessageByIdService(req.params.id);
    res.status(200).json({ data: message });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
