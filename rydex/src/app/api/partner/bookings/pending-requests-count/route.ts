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

    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return Response.json({ message: "Partner not found" }, { status: 404 });
    }

    const count = await Booking.countDocuments({
      driver: partner._id,
      bookingStatus: "requested",
    });

    return Response.json(count, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `fetch pending req count error ${error}` },
      { status: 500 },
    );
  }
}
