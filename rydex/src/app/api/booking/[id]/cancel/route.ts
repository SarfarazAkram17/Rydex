import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";

export async function GET(
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

    booking.bookingStatus = "cancelled";
    await booking.save();

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Cancel booking error ${error}` },
      { status: 500 },
    );
  }
}
