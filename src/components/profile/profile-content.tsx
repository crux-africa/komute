import { requireAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export default async function ProfileContent() {
  const user = await requireAuth();
  const profile = user.driverProfile;

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 font-heading text-xl font-bold text-forest dark:bg-forest-light/10 dark:text-forest-light">
              {(user.name || "U").charAt(0)}
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">{user.name || "Commuter"}</h2>
              <p className="font-body text-sm text-muted-foreground">{user.phone}</p>
              <div className="flex gap-1.5 mt-2">
                {user.roles.map(r => <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="font-body text-sm text-muted-foreground">Rating</span>
              <span className="font-body text-sm font-medium">★ {user.rating > 0 ? user.rating.toFixed(1) : "No ratings yet"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="font-body text-sm text-muted-foreground">Home area</span>
              <span className="font-body text-sm">{user.homeArea || "Not set"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="font-body text-sm text-muted-foreground">Work area</span>
              <span className="font-body text-sm">{user.workArea || "Not set"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="font-body text-sm text-muted-foreground">NIN verified</span>
              <span className="font-body text-sm">{user.ninVerified ? <span className="flex items-center gap-1 text-forest dark:text-forest-light"><Shield className="h-3 w-3" />Verified</span> : "Not verified"}</span>
            </div>
            {profile && (
              <>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="font-body text-sm text-muted-foreground">Vehicle</span>
                  <span className="font-body text-sm">{profile.vehicleColor} {profile.vehicleMake} {profile.vehicleModel}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="font-body text-sm text-muted-foreground">License</span>
                  <span className="font-body text-sm">{profile.licenseVerified ? "✓ Verified" : "Pending"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-body text-sm text-muted-foreground">Plate</span>
                  <span className="font-body text-sm font-medium">{profile.plateNumber}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
