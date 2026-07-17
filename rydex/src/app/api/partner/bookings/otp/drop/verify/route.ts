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

    if (!booking.dropOtp) {
      return Response.json(
        { message: "Drop OTP not generated" },
        { status: 400 },
      );
    }

    if (booking.dropOtp !== otp) {
      return Response.json({ message: "Incorrect drop OTP" }, { status: 400 });
    }

    if (booking.dropOtpExpires < new Date()) {
      return Response.json({ message: "Drop OTP expired" }, { status: 400 });
    }

    if (booking.paymentStatus === "cash") {
      const adminCommission = booking.fare * 0.1;
      const partnerAmount = booking.fare - adminCommission;
      booking.adminCommission = adminCommission;
      booking.partnerAmount = partnerAmount;
    }

    booking.paymentStatus = "paid";
    booking.bookingStatus = "completed";
    booking.dropOtp = "";
    booking.dropOtpExpires = undefined;
    await booking.save();

    return Response.json({ message: "Drop OTP verified" }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Drop OTP verify error ${error}` },
      { status: 500 },
    );
  }
}
