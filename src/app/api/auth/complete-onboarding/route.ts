import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, createSession } from "@/lib/auth";
import {
  onboardingSchema,
  driverOnboardingSchema,
} from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { step } = body as { step: string };

    // =========================================
    // STEP 1: Basic profile (all users)
    // =========================================
    if (step === "profile") {
      const validation = onboardingSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      const { firstName, lastName, role, homeArea, workArea } =
        validation.data;

      const roles =
        role === "BOTH" ? ["RIDER", "DRIVER"] : [role];

      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          roles: roles as ("RIDER" | "DRIVER")[],
          homeArea,
          workArea,
          // Mark as onboarded if rider-only (drivers still need vehicle info)
          isOnboarded: !roles.includes("DRIVER"),
        },
      });

      return NextResponse.json({
        message: "Profile updated",
        nextStep: roles.includes("DRIVER") ? "vehicle" : "complete",
        roles,
      });
    }

    // =========================================
    // STEP 2: Driver vehicle details
    // =========================================
    if (step === "vehicle") {
      if (!user.roles.includes("DRIVER")) {
        return NextResponse.json(
          { error: "Not a driver account" },
          { status: 400 }
        );
      }

      const validation = driverOnboardingSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      const data = validation.data;

      // Create or update driver profile
      await prisma.driverProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          vehicleType: data.vehicleType,
          vehicleMake: data.vehicleMake,
          vehicleModel: data.vehicleModel,
          vehicleYear: data.vehicleYear,
          vehicleColor: data.vehicleColor,
          plateNumber: data.plateNumber,
          maxSeats: data.maxSeats,
          licenseNumber: data.licenseNumber,
        },
        update: {
          vehicleType: data.vehicleType,
          vehicleMake: data.vehicleMake,
          vehicleModel: data.vehicleModel,
          vehicleYear: data.vehicleYear,
          vehicleColor: data.vehicleColor,
          plateNumber: data.plateNumber,
          maxSeats: data.maxSeats,
          licenseNumber: data.licenseNumber,
        },
      });

      return NextResponse.json({
        message: "Vehicle details saved",
        nextStep: "verify-license",
      });
    }

    // =========================================
    // STEP 3: Mark onboarding complete
    // =========================================
    if (step === "complete") {
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnboarded: true },
      });

      // Refresh session with updated data
      await createSession(user.id);

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { driverProfile: true },
      });

      return NextResponse.json({
        message: "Onboarding complete",
        user: {
          id: updatedUser!.id,
          name: updatedUser!.name,
          roles: updatedUser!.roles,
          isOnboarded: true,
          ninVerified: updatedUser!.ninVerified,
          driverProfile: updatedUser!.driverProfile
            ? {
              vehicleType: updatedUser!.driverProfile.vehicleType,
              licenseVerified:
                updatedUser!.driverProfile.licenseVerified,
              bankVerified:
                updatedUser!.driverProfile.bankVerified,
              faceVerified:
                updatedUser!.driverProfile.faceVerified,
            }
            : null,
        },
        redirectTo: updatedUser!.roles.includes("DRIVER")
          ? "/driver"
          : "/rider",
      });
    }

    return NextResponse.json(
      { error: "Invalid step", validSteps: ["profile", "vehicle", "complete"] },
      { status: 400 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Onboarding failed. Please try again." },
      { status: 500 }
    );
  }
}