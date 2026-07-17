import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";

export async function POST(req: Request) {
  try {
    await connectDb();

    const { bookingId, otp } = await req.json();

    const booking = await Booking.findById(bookingId).populate("user");
    if (!booking) {
      return Response.json({ message: "Booking not found" }, { status: 404 });
    }

    if (!booking.pickUpOtp) {
      return Response.json(
        { message: "Pickup OTP not generated" },
        { status: 400 },
      );
    }

    if (booking.pickUpOtp !== otp) {
      return Response.json(
        { message: "Incorrect pickup OTP" },
        { status: 400 },
      );
    }

    if (booking.pickUpOtpExpires < new Date()) {
      return Response.json({ message: "Pickup OTP expired" }, { status: 400 });
    }

    booking.bookingStatus = "started";
    booking.pickUpOtp = "";
    booking.pickUpOtpExpires = undefined;
    await booking.save();

    return Response.json({ message: "Pickup OTP verified" }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Pickup OTP verify error ${error}` },
      { status: 500 },
    );
  }
}
