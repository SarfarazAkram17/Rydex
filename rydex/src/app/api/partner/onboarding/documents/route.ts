import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
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

    const formdata = await req.formData();
    const aadhar = formdata.get("aadhar") as Blob | null;
    const license = formdata.get("license") as Blob | null;
    const rc = formdata.get("rc") as Blob | null;

    if (!aadhar || !license || !rc) {
      return Response.json(
        { message: "All documents are required" },
        { status: 400 },
      );
    }

    const updatePayload: any = {
      status: "pending",
    };

    if (aadhar) {
      const url = await uploadOnCloudinary(aadhar);
      if (!url) {
        return Response.json(
          { message: "Aadhar upload failed" },
          { status: 500 },
        );
      }
      updatePayload.aadharUrl = url;
    }

    if (license) {
      const url = await uploadOnCloudinary(license);
      if (!url) {
        return Response.json(
          { message: "License upload failed" },
          { status: 500 },
        );
      }
      updatePayload.licenseUrl = url;
    }

    if (rc) {
      const url = await uploadOnCloudinary(rc);
      if (!url) {
        return Response.json({ message: "RC upload failed" }, { status: 500 });
      }
      updatePayload.rcUrl = url;
    }

    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      { $set: updatePayload },
      { upsert: true, new: true },
    );

    if (user.partnerOnboardingSteps < 2) {
      user.partnerOnboardingSteps = 2;
    } else {
      user.partnerOnboardingSteps = 3;
    }
    user.partnerStatus = "pending";
    await user.save();

    return Response.json(partnerDocs, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: `Partner docs error ${error}` },
      { status: 500 },
    );
  }
}
