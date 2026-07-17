import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export async function GET() {
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

    if (partner.videoKycStatus !== "rejected") {
      return Response.json(
        { message: "You can't send KYC request at this time" },
        { status: 400 },
      );
    }

    partner.videoKycStatus = "pending";
    partner.videoKycRejectionReason = undefined;
    partner.videoRoomId = undefined;

    await partner.save();
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `KYC request error ${error}` },
      { status: 500 },
    );
  }
}