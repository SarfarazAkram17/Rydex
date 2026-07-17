import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";

export async function GET(req: Request) {
  try {
    await connectDb();

    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    const bookings = await Booking.find({ user: user._id })
      .populate("user driver vehicle")
      .sort({ createdAt: -1 });

    return Response.json(bookings, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Get booking for partner error ${error}` },
      { status: 500 },
    );
  }
}