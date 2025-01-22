import mongoose, { Model, Schema } from "mongoose";
import { ChatInt } from "../interface";

const chatSchema: Schema<ChatInt> = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Chat: Model<ChatInt> = mongoose.model("Chat", chatSchema);
export default Chat;
