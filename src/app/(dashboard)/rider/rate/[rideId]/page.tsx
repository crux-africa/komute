"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Star, Loader2 } from "lucide-react";

export default function RatePage({ params }: { params: Promise<{ rideId: string }> }) {
  const { rideId } = use(params);
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [driverInfo, setDriverInfo] = useState<{ id: string; name: string } | null>(null);

  // Fetch ride info to get the driver
  useState(() => {
    fetch(`/api/rides/${rideId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.driver) {
          setDriverInfo({ id: data.driver.id, name: data.driver.name || "Driver" });
        }
      })
      .catch(() => { });
  });

  async function submitRating() {
    if (score === 0) return;
    if (!driverInfo) {
      setError("Could not load driver info. Try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId,
          toUserId: driverInfo.id,
          score,
          comment: comment.trim() || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setDone(true);
      setTimeout(() => router.push("/rider/bookings"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-forest dark:text-forest-light mb-4" />
            <h2 className="font-heading text-xl font-bold">Thanks for the feedback!</h2>
            <p className="font-body text-sm text-muted-foreground mt-2">Your rating helps make Komute safer for everyone.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="font-heading text-xl font-bold">How was your ride?</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Rate your experience with {driverInfo?.name || "your driver"}
            </p>
          </div>

          {/* Star rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setScore(i)}
                onMouseEnter={() => setHoveredScore(i)}
                onMouseLeave={() => setHoveredScore(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-10 w-10 transition-colors ${i <= (hoveredScore || score)
                      ? "fill-amber text-amber"
                      : "text-border"
                    }`}
                />
              </button>
            ))}
          </div>

          {score > 0 && (
            <p className="text-center font-body text-sm text-muted-foreground">
              {score === 1 && "Poor"}
              {score === 2 && "Fair"}
              {score === 3 && "Good"}
              {score === 4 && "Great"}
              {score === 5 && "Excellent!"}
            </p>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Tell us more about your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="h-24 resize-none font-body"
            />
            <p className="font-body text-[10px] text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 font-body text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            onClick={submitRating}
            disabled={score === 0 || loading}
            className="w-full h-12 bg-forest hover:bg-forest-light text-[#FAFAF8] font-semibold text-base"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
            ) : (
              "Submit rating"
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/rider/bookings")}
            className="w-full font-body text-sm"
          >
            Skip for now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}