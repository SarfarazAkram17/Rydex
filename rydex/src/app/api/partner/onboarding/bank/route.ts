import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDb();

    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const { accountHolder, accountNumber, upi, ifsc, mobileNumber } =
      await req.json();
    if (!accountHolder || !accountNumber || !ifsc || !mobileNumber) {
      return Response.json(
        { message: "Send all bank details" },
        { status: 400 },
      );
    }

    const partnerBank = await PartnerBank.findOneAndUpdate(
      { owner: user._id },
      { accountHolder, accountNumber, ifsc, status: "added", upi },
      { upsert: true, new: true },
    );

    user.mobileNumber = mobileNumber;
    user.partnerOnboardingSteps = 3;
    user.partnerStatus = "pending";
    await user.save();

    return Response.json(partnerBank, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: `Partner bank error ${error}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDb();

    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const partnerBank = await PartnerBank.findOne({ owner: user._id });
    if (partnerBank) {
      return Response.json(
        { partnerBank, mobileNumber: user.mobileNumber },
        { status: 200 },
      );
    } else {
      return Response.json(
        { message: "Bank details not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    return Response.json(
      { message: `Get partner bank error ${error}` },
      { status: 500 },
    );
  }
}
