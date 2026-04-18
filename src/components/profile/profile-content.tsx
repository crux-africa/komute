import { requireAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/utils";
import {
  Shield,
  Car,
  MapPin,
  Star,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  Clock,
  Briefcase
} from "lucide-react";

export default async function ProfileContent() {
  const user = await requireAuth();
  const profile = user.driverProfile;

  const [totalTrips, totalBookings] = await Promise.all([
    profile ? prisma.booking.count({
      where: { ride: { driverId: user.id }, status: "COMPLETED" }
    }) : 0,
    prisma.booking.count({
      where: { riderId: user.id, status: { in: ["CONFIRMED", "COMPLETED"] } }
    })
  ]);

  const isDriver = user.roles.includes("DRIVER");

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-forest/20 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-forest to-forest-light" />
        <CardContent className="px-6 pb-6">
          <div className="-mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-amber to-amber-dark flex items-center justify-center text-[#FAFAF8] font-heading text-3xl font-bold shadow-lg border-4 border-background">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading text-2xl font-bold">{user.name || "Commuter"}</h2>
                {user.ninVerified && (
                  <Badge className="bg-forest/10 text-forest border-forest/20 font-body text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    ID Verified
                  </Badge>
                )}
              </div>
              <p className="font-body text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {user.phone}
              </p>
              {user.email && (
                <p className="font-body text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {user.roles.map(r => (
                <Badge
                  key={r}
                  variant="secondary"
                  className={`font-body text-xs px-3 py-1 ${r === "DRIVER" ? "bg-amber/10 text-amber-dark" : "bg-forest/10 text-forest"
                    }`}
                >
                  {r === "DRIVER" ? "🚗 Driver" : "👤 Rider"}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-amber/10 to-amber/5 border-amber/20">
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 text-amber mx-auto mb-1" />
            <p className="font-heading text-xl font-bold">{user.rating > 0 ? user.rating.toFixed(1) : "—"}</p>
            <p className="font-body text-[10px] text-muted-foreground">Rating</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-forest/10 to-forest/5 border-forest/20">
          <CardContent className="p-4 text-center">
            <Car className="h-5 w-5 text-forest mx-auto mb-1" />
            <p className="font-heading text-xl font-bold">{totalBookings}</p>
            <p className="font-body text-[10px] text-muted-foreground">Trips</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-terra/10 to-terra/5 border-terra/20">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 text-terra mx-auto mb-1" />
            <p className="font-heading text-xl font-bold">{formatDate(user.createdAt).split(",")[0]}</p>
            <p className="font-body text-[10px] text-muted-foreground">Joined</p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Status */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-forest" />
            Verification Status
          </h3>
          <div className="space-y-3">
            <VerificationItem
              label="NIN Verification"
              verified={user.ninVerified}
              description="National Identity Number"
            />
            {isDriver && profile && (
              <>
                <VerificationItem
                  label="Driver's License"
                  verified={profile.licenseVerified}
                  description={profile.licenseNumber || "License on file"}
                />
                <VerificationItem
                  label="Vehicle Details"
                  verified={!!profile.vehiclePhotoUrl}
                  description={`${profile.vehicleColor || ""} ${profile.vehicleMake || ""} ${profile.vehicleModel || ""}`.trim() || "Vehicle registered"}
                />
                <VerificationItem
                  label="Bank Account"
                  verified={profile.bankVerified}
                  description={profile.bankName ? `${profile.bankName} ••••${profile.bankAccountNumber?.slice(-4)}` : "Bank account linked"}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Commute Routes */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-forest" />
            Commute Routes
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-forest/5 border border-forest/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10">
                <MapPin className="h-5 w-5 text-forest" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">Home</p>
                <p className="font-body text-sm font-medium">{user.homeArea || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber/5 border border-amber/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber/10">
                <Briefcase className="h-5 w-5 text-amber" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">Work</p>
                <p className="font-body text-sm font-medium">{user.workArea || "Not set"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Info */}
      {isDriver && profile && (
        <Card className="border-amber/20">
          <CardContent className="p-5">
            <h3 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
              <Car className="h-4 w-4 text-amber" />
              Driver Details
            </h3>
            <div className="space-y-4">
              {/* Vehicle */}
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber/10">
                  <Car className="h-6 w-6 text-amber" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs text-muted-foreground">Vehicle</p>
                  <p className="font-body text-sm font-medium">
                    {profile.vehicleColor} {profile.vehicleMake} {profile.vehicleModel}
                    {profile.vehicleYear && ` (${profile.vehicleYear})`}
                  </p>
                  <p className="font-heading text-sm font-bold text-forest mt-1">
                    {profile.plateNumber}
                  </p>
                </div>
              </div>

              {/* Earnings */}
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-terra/10">
                  <CreditCard className="h-6 w-6 text-terra" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs text-muted-foreground">Earnings</p>
                  <p className="font-heading text-lg font-bold text-terra">
                    {formatNaira(profile.totalEarnings)}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {totalTrips} completed trips • Max {profile.maxSeats} seats
                  </p>
                </div>
              </div>

              {/* Approval Status */}
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${profile.isApproved ? "bg-terra/10" : "bg-amber/10"
                  }`}>
                  {profile.isApproved ? (
                    <CheckCircle2 className="h-6 w-6 text-terra" />
                  ) : (
                    <Clock className="h-6 w-6 text-amber" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs text-muted-foreground">Account Status</p>
                  <Badge className={`mt-1 ${profile.isApproved
                      ? "bg-terra/10 text-terra border-terra/20"
                      : "bg-amber/10 text-amber border-amber/20"
                    }`}>
                    {profile.isApproved ? "Approved Driver" : "Pending Approval"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VerificationItem({
  label,
  verified,
  description
}: {
  label: string;
  verified: boolean;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${verified ? "bg-terra/10" : "bg-muted"
          }`}>
          {verified ? (
            <CheckCircle2 className="h-4 w-4 text-terra" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-body text-sm font-medium">{label}</p>
          <p className="font-body text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Badge
        variant="secondary"
        className={`text-[10px] ${verified ? "bg-terra/10 text-terra" : "bg-muted text-muted-foreground"}`}
      >
        {verified ? "Verified" : "Pending"}
      </Badge>
    </div>
  );
}
