import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bookings",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "driver"],
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;
