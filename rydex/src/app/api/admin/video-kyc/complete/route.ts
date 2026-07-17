import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDb();

    const session = await auth();
    if (!session || !session.user?.email || session.user?.role !== "admin") {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { roomId, action, reason } = await req.json();
    if (!roomId) {
      return Response.json({ message: "RoomId is required" }, { status: 400 });
    }

    if (!["approved", "rejected"].includes(action)) {
      return Response.json({ message: "Invalid action" }, { status: 400 });
    }

    const partner = await User.findOne({
      videoKycRoomId: roomId,
      role: "partner",
    });

    if (!partner) {
      return Response.json({ message: "Partner not found" }, { status: 404 });
    }

    if (action === "approved") {
      partner.videoKycStatus = "approved";
      partner.videoKycRejectionReason = undefined;
      partner.partnerOnboardingSteps = 5;
    }

    if (action === "rejected") {
      if (!reason)
        return Response.json(
          { message: "Rejection reason is required" },
          { status: 400 },
        );
      partner.videoKycStatus = "rejected";
      partner.videoKycRejectionReason = reason;
      partner.partnerOnboardingSteps = 4;
    }

    await partner.save();

    return Response.json({ status: partner.videoKycStatus }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `KYC complete error ${error}` },
      { status: 500 },
    );
  }
}
