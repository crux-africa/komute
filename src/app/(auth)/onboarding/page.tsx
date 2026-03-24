"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  onboardingSchema,
  ninVerificationSchema,
  driverOnboardingSchema,
  type OnboardingInput,
  type NINVerificationInput,
  type DriverOnboardingFormInput,
  type DriverOnboardingData,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ShieldCheck,
  Car,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Step = "profile" | "nin" | "vehicle" | "license" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [ninVerified, setNinVerified] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);

  // =========================================
  // STEP 1: Profile Form
  // =========================================
  const profileForm = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
  });

  async function submitProfile(data: OnboardingInput) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "profile", ...data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setRoles(result.roles);
      setCurrentStep("nin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  }

  // =========================================
  // STEP 2: NIN Verification
  // =========================================
  const ninForm = useForm<NINVerificationInput>({
    resolver: zodResolver(ninVerificationSchema),
  });

  async function submitNIN(data: NINVerificationInput) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "nin", id: data.nin }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      if (result.success) {
        setNinVerified(true);
        // If rider-only, go straight to complete
        if (!roles.includes("DRIVER")) {
          await completeOnboarding();
        } else {
          setCurrentStep("vehicle");
        }
      } else {
        setError(
          result.error || "NIN verification failed. Please check and try again."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "NIN verification failed");
    } finally {
      setIsLoading(false);
    }
  }

  // =========================================
  // STEP 3: Vehicle Details (Drivers)
  // =========================================
  const vehicleForm = useForm<DriverOnboardingFormInput, unknown, DriverOnboardingData>({
    resolver: zodResolver(driverOnboardingSchema),
  });

  async function submitVehicle(data: DriverOnboardingData) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "vehicle", ...data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      // Verify driver's license
      setCurrentStep("license");
      verifyDriverLicense(data.licenseNumber);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save vehicle details"
      );
    } finally {
      setIsLoading(false);
    }
  }

  // =========================================
  // STEP 4: Driver License Verification
  // =========================================
  async function verifyDriverLicense(licenseNumber: string) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "driver-license",
          id: licenseNumber,
        }),
      });
      const result = await res.json();

      if (result.success) {
        setLicenseVerified(true);
      } else {
        // Don't block onboarding — mark as pending verification
        setError(
          "License verification is pending. You can continue and it will be verified shortly."
        );
      }

      // Complete onboarding regardless
      await completeOnboarding();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "License verification failed"
      );
      // Still allow completion
      await completeOnboarding();
    } finally {
      setIsLoading(false);
    }
  }

  // =========================================
  // COMPLETE
  // =========================================
  async function completeOnboarding() {
    try {
      const res = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "complete" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setCurrentStep("complete");

      // Redirect after a moment
      setTimeout(() => {
        router.push(result.redirectTo || "/rider");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete onboarding"
      );
    }
  }

  // =========================================
  // STEP INDICATOR
  // =========================================
  const steps = roles.includes("DRIVER")
    ? ["profile", "nin", "vehicle", "license", "complete"]
    : ["profile", "nin", "complete"];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`h-2 rounded-full transition-all duration-300 ${i <= currentIndex
              ? "w-10 bg-primary"
              : "w-6 bg-muted"
              }`}
          />
        ))}
      </div>

      {/* ====== PROFILE STEP ====== */}
      {currentStep === "profile" && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center text-xl">
              Set up your profile
            </CardTitle>
            <CardDescription className="text-center">
              Tell us about yourself to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={profileForm.handleSubmit(submitProfile)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="Ade"
                    {...profileForm.register("firstName")}
                  />
                  {profileForm.formState.errors.firstName && (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Johnson"
                    {...profileForm.register("lastName")}
                  />
                  {profileForm.formState.errors.lastName && (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>I want to</Label>
                <Select
                  onValueChange={(val) =>
                    profileForm.setValue("role", val as "RIDER" | "DRIVER" | "BOTH")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RIDER">
                      Find rides (Rider)
                    </SelectItem>
                    <SelectItem value="DRIVER">
                      Offer rides (Driver)
                    </SelectItem>
                    <SelectItem value="BOTH">
                      Both — ride and drive
                    </SelectItem>
                  </SelectContent>
                </Select>
                {profileForm.formState.errors.role && (
                  <p className="text-xs text-destructive">
                    {profileForm.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeArea">Home area</Label>
                <Input
                  id="homeArea"
                  placeholder="e.g. Ikorodu, Ajah, Mowe"
                  {...profileForm.register("homeArea")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workArea">Work area</Label>
                <Input
                  id="workArea"
                  placeholder="e.g. Victoria Island, Ikeja, Lekki"
                  {...profileForm.register("workArea")}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ====== NIN VERIFICATION STEP ====== */}
      {currentStep === "nin" && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center text-xl">
              Verify your identity
            </CardTitle>
            <CardDescription className="text-center">
              Enter your National Identification Number (NIN) for verification.
              This helps keep everyone safe on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={ninForm.handleSubmit(submitNIN)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="nin">NIN (11 digits)</Label>
                <Input
                  id="nin"
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="12345678901"
                  autoFocus
                  {...ninForm.register("nin")}
                />
                {ninForm.formState.errors.nin && (
                  <p className="text-xs text-destructive">
                    {ninForm.formState.errors.nin.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying with NIMC...
                  </>
                ) : (
                  "Verify NIN"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Your NIN is verified securely via Interswitch. We do not store
                your full NIN details.
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ====== VEHICLE DETAILS STEP (Drivers) ====== */}
      {currentStep === "vehicle" && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center text-xl">
              Vehicle details
            </CardTitle>
            <CardDescription className="text-center">
              Tell us about the vehicle you&apos;ll use to offer rides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={vehicleForm.handleSubmit(submitVehicle)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Vehicle type</Label>
                <Select
                  onValueChange={(val) =>
                    vehicleForm.setValue(
                      "vehicleType",
                      val as "CAR" | "SHUTTLE" | "KEKE"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">Private Car</SelectItem>
                    <SelectItem value="SHUTTLE">
                      Shuttle / Minibus
                    </SelectItem>
                    <SelectItem value="KEKE">
                      Tricycle (Keke)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="vehicleMake">Make</Label>
                  <Input
                    id="vehicleMake"
                    placeholder="Toyota"
                    {...vehicleForm.register("vehicleMake")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Model</Label>
                  <Input
                    id="vehicleModel"
                    placeholder="Camry"
                    {...vehicleForm.register("vehicleModel")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="vehicleColor">Color</Label>
                  <Input
                    id="vehicleColor"
                    placeholder="Silver"
                    {...vehicleForm.register("vehicleColor")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Year</Label>
                  <Input
                    id="vehicleYear"
                    type="number"
                    placeholder="2020"
                    {...vehicleForm.register("vehicleYear")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate number</Label>
                <Input
                  id="plateNumber"
                  placeholder="LAG 123 XX"
                  {...vehicleForm.register("plateNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSeats">Available seats</Label>
                <Input
                  id="maxSeats"
                  type="number"
                  min={1}
                  max={14}
                  placeholder="3"
                  {...vehicleForm.register("maxSeats")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">
                  Driver&apos;s license number
                </Label>
                <Input
                  id="licenseNumber"
                  placeholder="AAA00000AA00"
                  {...vehicleForm.register("licenseNumber")}
                />
                <p className="text-xs text-muted-foreground">
                  Will be verified with FRSC via Interswitch
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save and verify license
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ====== LICENSE VERIFICATION STEP ====== */}
      {currentStep === "license" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Verifying your license...
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            {isLoading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Checking with FRSC database...
                </p>
              </>
            ) : licenseVerified ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-600" />
                <p className="font-medium text-green-600">
                  License verified
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-10 w-10 text-amber-500" />
                <p className="text-sm text-center text-muted-foreground">
                  {error ||
                    "Verification pending. You can still continue."}
                </p>
                <Button onClick={completeOnboarding}>
                  Continue anyway
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ====== COMPLETE STEP ====== */}
      {currentStep === "complete" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold">You&apos;re all set!</h2>
            <p className="text-center text-sm text-muted-foreground">
              {roles.includes("DRIVER")
                ? "Your profile is ready. Start offering rides to fellow commuters."
                : "Your profile is ready. Find affordable rides on your commute route."}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {ninVerified && (
                <span className="flex items-center gap-1 text-green-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  NIN verified
                </span>
              )}
              {licenseVerified && (
                <span className="flex items-center gap-1 text-green-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  License verified
                </span>
              )}
            </div>
            <Loader2 className="mt-2 h-4 w-4 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Redirecting...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}