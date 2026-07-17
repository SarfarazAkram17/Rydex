import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();
    if (!session || !session.user?.email || session.user?.role !== "admin") {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const totalPartners = await User.countDocuments({ role: "partner" });
    const totaleApprovedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "approved",
    });
    const totalePendingPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "pending",
    });
    const totaleRejectedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "rejected",
    });

    const pendingPartnerUsers = await User.find({
      role: "partner",
      partnerStatus: "pending",
      partnerOnboardingSteps: { $gte: 3 },
    });
    const partnerIds = pendingPartnerUsers.map((p) => p._id);
    const partnerVehicles = await Vehicle.find({
      owner: { $in: partnerIds },
    });
    const vehicleTypeMap = new Map(
      partnerVehicles.map((v) => [String(v.owner), v.type]),
    );

    const pendingPartnersReviews = pendingPartnerUsers.map((p) => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      vehicleType: vehicleTypeMap.get(String(p._id)),
    }));

    const pendingVehicles = await Vehicle.find({
      status: "pending",
      baseFare: { $exists: true },
      pricePerKM: { $exists: true },
      waitingCharge: { $exists: true },
    }).populate("owner");

    return NextResponse.json(
      {
        pendingVehicles,
        stats: {
          totalPartners,
          totaleApprovedPartners,
          totalePendingPartners,
          totaleRejectedPartners,
        },
        pendingPartnersReviews,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Admin dashboard error${error}` },
      { status: 500 },
    );
  }
}