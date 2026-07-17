import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDb();

    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await req.json();
    const booking = await Booking.findById(bookingId).populate(
      "user vehicle driver",
    );

    return Response.json(booking, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Get active ride for user error ${error}` },
      { status: 500 },
    );
  }
}
