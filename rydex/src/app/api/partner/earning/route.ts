import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";

export async function GET() {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email || session.user?.role !== "partner") {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const driver = await User.findOne({ email: session?.user?.email });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bookings = await Booking.find({
      driver: driver._id,
      paymentStatus: "paid",
      createdAt: { $gte: sevenDaysAgo },
    }).select("partnerAmount createdAt");

    const earningMap: Record<string, number> = {};

    bookings.forEach((b) => {
      const date = new Date(b.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      });

      earningMap[date] = (earningMap[date] || 0) + (b.partnerAmount || 0);
    });

    const earnings = Object.entries(earningMap).map(([date, earnings]) => ({
      date,
      earnings,
    }));

    return Response.json(earnings, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Partner earning error ${error}` },
      { status: 500 },
    );
  }
}
