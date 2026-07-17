import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import axios from "axios";

export async function POST(req: Request) {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      driverId,
      vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      mobileNumber,
    } = await req.json();

    if (
      !driverId ||
      !vehicleId ||
      !pickUpLocation.coordinates ||
      !dropLocation.coordinates
    ) {
      return Response.json(
        { message: "Missing requried details" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: session.user.email });

    const driver = await User.findById(driverId);
    if (!driver) {
      return Response.json({ message: "Driver not found" }, { status: 404 });
    }

    const existing = await Booking.findOne({
      user: user._id,
      bookingStatus: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      },
    });

    if (existing) {
      return Response.json(existing);
    }

    const booking = await Booking.create({
      user: user._id,
      driver,
      vehicle: vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      userMobileNumber: mobileNumber,
      driverMobileNumber: driver.mobileNumber,
      bookingStatus: "requested",
    });

    await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
      event: "new-booking",
      userId: driverId,
      data: booking,
    });

    return Response.json(booking, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: `Create booking error ${error}` },
      { status: 500 },
    );
  }
}
