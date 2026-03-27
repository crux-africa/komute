import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyTransaction } from "@/lib/interswitch";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resp = searchParams.get("resp");
  const txnRef = searchParams.get("txnref");
  const rideId = sessionStorage.getItem("isw_ride_id");
  const seats = sessionStorage.getItem("isw_seats");

  console.log("[Payment Callback] GET received:", { txnRef, resp, rideId, seats });

  // Return HTML that posts message back to parent and closes
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Processing Payment...</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #1B4332; margin-bottom: 10px; }
    p { color: #666; }
    .spinner { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <h1 id="title">Processing your payment...</h1>
    <p id="message">Please wait</p>
  </div>
  <script>
    (async function() {
      const params = new URLSearchParams(window.location.search);
      const resp = params.get('resp');
      const txnRef = params.get('txnref');
      
      console.log('Callback received:', { resp, txnRef });
      
      if (resp === '00' && txnRef) {
        document.getElementById('title').textContent = 'Payment Successful!';
        document.getElementById('message').textContent = 'Confirming your booking...';
        
        // Send success message to parent
        if (window.opener) {
          window.opener.postMessage({ type: 'ISW_PAYMENT_SUCCESS', txnRef }, window.location.origin);
        }
        
        // Redirect parent to bookings with success
        if (window.opener) {
          window.opener.location.href = '/rider/bookings?success=true&txnRef=' + txnRef;
        }
        
        setTimeout(() => { window.close(); }, 2000);
      } else {
        document.getElementById('title').textContent = 'Payment Failed';
        document.getElementById('message').textContent = resp || 'Payment was not completed';
        
        if (window.opener) {
          window.opener.postMessage({ type: 'ISW_PAYMENT_FAILED', error: resp || 'Payment failed' }, window.location.origin);
        }
        
        if (window.opener) {
          window.opener.location.href = '/rider/bookings?error=payment_failed';
        }
        
        setTimeout(() => { window.close(); }, 3000);
      }
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const txnRef = params.get("txnref");
    const resp = params.get("resp");
    const rideId = params.get("rideId") || sessionStorage.getItem("isw_ride_id");
    const seats = params.get("seats") || sessionStorage.getItem("isw_seats") || "1";

    console.log("[Payment Callback] POST received:", { txnRef, resp, rideId, seats });

    if (resp !== "00" || !txnRef) {
      return new NextResponse(`
        <html><body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'ISW_PAYMENT_FAILED', error: '${resp || 'Payment failed'}' }, window.location.origin);
              window.opener.location.href = '/rider/bookings?error=payment_failed';
            }
            window.close();
          </script>
          <h1>Payment Failed</h1>
          <p>Redirecting...</p>
        </body></html>`, { headers: { "Content-Type": "text/html" } });
    }

    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse(`<html><body><script>window.opener.location.href='/login';window.close();</script></body></html>`, { headers: { "Content-Type": "text/html" } });
    }

    const ride = await prisma.ride.findUnique({ where: { id: rideId || "" } });
    if (!ride) {
      return new NextResponse(`<html><body><script>window.opener.location.href='/rider/bookings?error=ride_not_found';window.close();</script></body></html>`, { headers: { "Content-Type": "text/html" } });
    }

    const seatCount = parseInt(seats);
    const totalPrice = ride.pricePerSeat * seatCount;

    const verification = await verifyTransaction(txnRef, totalPrice);
    console.log("[Payment Callback] Verification:", verification);

    if (!verification.success) {
      return new NextResponse(`<html><body><script>window.opener.location.href='/rider/bookings?error=verification_failed';window.close();</script></body></html>`, { headers: { "Content-Type": "text/html" } });
    }

    const existing = await prisma.booking.findUnique({
      where: { rideId_riderId: { rideId: rideId || "", riderId: user.id } },
    });

    if (existing && existing.status !== "CANCELLED") {
      return new NextResponse(`<html><body><script>window.opener.location.href='/rider/bookings?error=already_booked';window.close();</script></body></html>`, { headers: { "Content-Type": "text/html" } });
    }

    const [booking] = await prisma.$transaction([
      prisma.booking.upsert({
        where: { rideId_riderId: { rideId: rideId || "", riderId: user.id } },
        create: { rideId: rideId || "", riderId: user.id, seats: seatCount, totalPrice, status: "CONFIRMED", confirmedAt: new Date() },
        update: { seats: seatCount, totalPrice, status: "CONFIRMED", confirmedAt: new Date(), cancelledAt: null, cancelReason: null },
      }),
      prisma.ride.update({
        where: { id: rideId || "" },
        data: { availableSeats: { decrement: seatCount } },
      }),
    ]);

    await prisma.payment.create({
      data: {
        bookingId: booking.id, userId: user.id, amount: totalPrice, transactionRef: txnRef,
        paymentRef: verification.data?.PaymentReference, responseCode: verification.data?.ResponseCode,
        responseDescription: verification.data?.ResponseDescription, status: "VERIFIED", verifiedAt: new Date(),
      },
    });

    return new NextResponse(`
      <html><body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'ISW_PAYMENT_SUCCESS', txnRef: '${txnRef}' }, window.location.origin);
            window.opener.location.href = '/rider/bookings?success=true&bookingId=${booking.id}';
          }
          window.close();
        </script>
        <h1>Payment Successful!</h1>
        <p>Confirming your booking...</p>
      </body></html>`, { headers: { "Content-Type": "text/html" } });

  } catch (error) {
    console.error("[Payment Callback] Error:", error);
    return new NextResponse(`<html><body><script>window.opener.location.href='/rider/bookings?error=server_error';window.close();</script><h1>Error</h1></body></html>`, { headers: { "Content-Type": "text/html" } });
  }
}
