import connectDb from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";

export async function POST(req: Request) {
  try {
    await connectDb();

    const { bookingId } = await req.json();

    const msgs = await ChatMessage.find({ bookingId });

    return Response.json(msgs, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Get all messages error ${error}` },
      { status: 500 },
    );
  }
}