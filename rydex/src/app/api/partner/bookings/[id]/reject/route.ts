import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import axios from "axios";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const id = (await context.params).id;
    await connectDb();

    const booking = await Booking.findById(id);

    if (!booking || booking.bookingStatus !== "requested") {
      return Response.json({ message: "Invalid" }, { status: 400 });
    }

    booking.bookingStatus = "rejected";
    await booking.save();

    await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
      event: "reject-booking",
      userId: booking.user,
      data: booking.bookingStatus,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Reject booking error ${error}` },
      { status: 500 },
    );
  }
}
