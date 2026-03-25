import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  verifyNIN,
  verifyNINFullDetails,
  verifyBVNFullDetails,
  verifyDriversLicense,
  verifyBankAccount,
  compareFaces,
} from "@/lib/interswitch";

const VERIFICATION_HANDLERS: Record<
  string,
  (
    id: string,
    extra?: Record<string, string>,
  ) => Promise<{
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
    rawResponse?: Record<string, unknown>;
  }>
> = {
  nin: (id, extra) =>
    verifyNIN(id, extra?.firstName || "", extra?.lastName || ""),
  "nin-full": (id) => verifyNINFullDetails(id),
  "bvn-full": (id) => verifyBVNFullDetails(id),
  "driver-license": (id) => verifyDriversLicense(id),
  "bank-account": (id, extra) => verifyBankAccount(id, extra?.bankCode || ""),
  "face-comparison": (_id, extra) =>
    compareFaces(extra?.image1 || "", extra?.image2 || ""),
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, id, ...extra } = body as {
      type: string;
      id: string;
      [key: string]: string;
    };

    if (!type || !VERIFICATION_HANDLERS[type]) {
      return NextResponse.json(
        {
          error: "Invalid verification type",
          validTypes: Object.keys(VERIFICATION_HANDLERS),
        },
        { status: 400 },
      );
    }

    if (!id && type !== "face-comparison") {
      return NextResponse.json(
        { error: "ID number is required" },
        { status: 400 },
      );
    }

    // Call Interswitch
    const handler = VERIFICATION_HANDLERS[type];
    const result = await handler(id, extra);

    // Log the identity check
    const identityCheck = await prisma.identityCheck.create({
      data: {
        userId: user.id,
        type: type.toUpperCase().replace("-", "_"),
        idNumber: type === "face-comparison" ? undefined : id,
        status: result.success ? "VERIFIED" : "FAILED",
        rawResponse:
          result.rawResponse ? (result.rawResponse as object) : undefined,
        errorMessage: result.error,
        verifiedAt: result.success ? new Date() : undefined,
      },
    });

    // Update user record based on verification type
    if (result.success) {
      switch (type) {
        case "nin":
        case "nin-full":
          const firstName =
            typeof result.data?.firstName === "string" ?
              result.data.firstName
              : undefined;
          const lastName =
            typeof result.data?.lastName === "string" ?
              result.data.lastName
              : undefined;

          const userUpdateData: {
            ninVerified: boolean;
            ninNumber: string;
            ninVerifiedAt: Date;
            firstName?: string;
            lastName?: string;
            name?: string;
          } = {
            ninVerified: true,
            ninNumber: id,
            ninVerifiedAt: new Date(),
          };

          if (firstName) userUpdateData.firstName = firstName;
          if (lastName) userUpdateData.lastName = lastName;
          if (firstName && lastName)
            userUpdateData.name = `${firstName} ${lastName}`;

          await prisma.user.update({
            where: { id: user.id },
            data: userUpdateData,
          });
          break;

        case "driver-license":
          if (user.driverProfile) {
            await prisma.driverProfile.update({
              where: { userId: user.id },
              data: {
                licenseVerified: true,
                licenseVerifiedAt: new Date(),
                licenseNumber: id,
              },
            });
          }
          break;

        case "bank-account":
          if (user.driverProfile) {
            await prisma.driverProfile.update({
              where: { userId: user.id },
              data: {
                bankVerified: true,
                bankAccountNumber: id,
                bankCode: extra.bankCode || "",
                bankAccountName: (result.data?.accountName as string) || "",
              },
            });
          }
          break;

        case "face-comparison":
          if (user.driverProfile) {
            await prisma.driverProfile.update({
              where: { userId: user.id },
              data: {
                faceVerified: true,
                faceVerifiedAt: new Date(),
              },
            });
          }
          break;
      }
    }

    return NextResponse.json({
      success: result.success,
      checkId: identityCheck.id,
      status: identityCheck.status,
      data: result.success ? result.data : undefined,
      error: result.error,
    });
  } catch (error) {
    console.error("Identity verification error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}
