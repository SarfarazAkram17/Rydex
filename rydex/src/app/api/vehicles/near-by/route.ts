import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";

export async function POST(req: Request) {
  try {
    await connectDb();
    const { latitude, longitude, vehicleType } = await req.json();

    if (!latitude || !longitude) {
      return Response.json({ message: "Coordinates missing" }, { status: 400 });
    }

    const partners = await User.find({
      role: "partner",
      isOnline: true,
      partnerStatus: "approved",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 10000,
        },
      },
    });

    const partnerIds = partners.map((p) => p._id);

    if (partnerIds.length == 0) {
      return Response.json([], { status: 200 });
    }

    const vehicles = await Vehicle.find({
      owner: { $in: partnerIds },
      type: vehicleType,
      status: "approved",
      isActive: true,
    }).lean();

    return Response.json(vehicles, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Near by vehicles error ${error}` },
      { status: 500 },
    );
  }
}
