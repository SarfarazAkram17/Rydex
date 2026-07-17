import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDb();
    const bookingId = (await context.params).id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return Response.json({ success: false, message: "Booking not found" });
    }

    booking.paymentStatus = "cash";
    booking.bookingStatus = "confirmed";
    await booking.save();

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: `Cash confirm error ${error}` },
      { status: 500 },
    );
  }
}