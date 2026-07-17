import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    const booking = await Booking.findOne({
      driver: user,
      bookingStatus: { $in: ["confirmed", "started"] },
    }).populate("user vehicle driver");

    return Response.json(booking, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Get active ride for partner error ${error}` },
      { status: 500 },
    );
  }
}