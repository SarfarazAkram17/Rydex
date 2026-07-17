import connectDb from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";

export async function POST(req: Request) {
  try {
    await connectDb();
    
    const { bookingId, sender, text } = await req.json();

    const msg = await ChatMessage.create({ bookingId, sender, text });

    return Response.json(msg, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: `Send message error ${error}` },
      { status: 500 },
    );
  }
}
