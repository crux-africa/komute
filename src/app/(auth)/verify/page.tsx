"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedPhone = sessionStorage.getItem("otp_phone");
    if (!storedPhone) {
      router.replace("/login");
      return;
    }
    setPhone(storedPhone);
    inputRefs.current[0]?.focus();
  }, [router]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(
      () => setResendCountdown((c) => c - 1),
      1000
    );
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  function handleInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];

    // Handle paste of full OTP
    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      digits.forEach((d, i) => {
        if (i + index < 6) newCode[i + index] = d;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      // Auto-submit if all filled
      if (newCode.every((d) => d !== "")) {
        submitCode(newCode.join(""));
      }
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every((d) => d !== "")) {
      submitCode(newCode.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function submitCode(otpCode: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Invalid OTP");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // Clean up
      sessionStorage.removeItem("otp_phone");

      // Redirect based on onboarding status
      router.push(result.redirectTo || "/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setResendCountdown(60);
    setError(null);

    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
    } catch {
      setError("Failed to resend. Try again.");
    }
  }

  // Mask phone for display: 08012***678
  const maskedPhone = phone
    ? phone.slice(0, 5) + "***" + phone.slice(-3)
    : "";

  return (
    <Card>
      <CardHeader>
        <button
          onClick={() => router.back()}
          className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <CardTitle className="text-xl">Enter verification code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to {maskedPhone} via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* OTP Input Grid */}
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              className="h-14 w-12 text-center text-xl font-semibold"
            />
          ))}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying...
          </div>
        )}

        {/* Resend */}
        <div className="text-center">
          {resendCountdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in {resendCountdown}s
            </p>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={isLoading}
            >
              Resend code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}