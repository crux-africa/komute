"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"

// Extend Window to include Interswitch's global function
declare global {
  interface Window {
    webpayCheckout: (config: InterswitchPaymentConfig) => void
  }
}

interface InterswitchPaymentConfig {
  merchant_code: string
  pay_item_id: string
  txn_ref: string
  amount: number
  currency: number
  cust_name?: string
  cust_email: string
  cust_id?: string
  site_redirect_url?: string
  onComplete: (response: InterswitchResponse) => void
  mode: "TEST" | "LIVE"
}

interface InterswitchResponse {
  resp: string        // Response code ("00" = success)
  desc: string        // Description
  txnref: string      // Transaction reference
  amount: number
  apprAmt: number
  payRef: string
  retRef: string
  cardNum: string
}

interface PayButtonProps {
  amount: number           // Amount in kobo (₦800 = 80000)
  rideId: string
  customerEmail: string
  customerName?: string
  customerId?: string
  onSuccess: (response: InterswitchResponse, txnRef: string) => void
  onFailure: (response: InterswitchResponse) => void
  disabled?: boolean
}

export function InterswitchPayButton({
  amount,
  rideId,
  customerEmail,
  customerName,
  customerId,
  onSuccess,
  onFailure,
  disabled = false,
}: PayButtonProps) {

  const handlePayment = useCallback(() => {
    if (!window.webpayCheckout) {
      console.error("Interswitch checkout script not loaded")
      return
    }

    const txnRef = `KMT_${rideId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const paymentConfig: InterswitchPaymentConfig = {
      merchant_code: process.env.NEXT_PUBLIC_ISW_MERCHANT_CODE!,
      pay_item_id: process.env.NEXT_PUBLIC_ISW_PAY_ITEM_ID!,
      txn_ref: txnRef,
      amount: amount,                // Already in kobo/minor
      currency: 566,                 // 566 = Nigerian Naira (ISO 4217)
      cust_email: customerEmail,
      cust_name: customerName,
      cust_id: customerId,
      site_redirect_url: window.location.origin + "/rider/bookings",
      mode: "TEST",                  // Change to "LIVE" for production
      onComplete: (response) => {
        if (response.resp === "00") {
          // Payment reported as successful on client-side
          // IMPORTANT: Still need server-side verification before giving value
          onSuccess(response, txnRef)
        } else {
          onFailure(response)
        }
      },
    }

    window.webpayCheckout(paymentConfig)
  }, [amount, rideId, customerEmail, customerName, customerId, onSuccess, onFailure])

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled}
      className="w-full"
      size="lg"
    >
      Pay ₦{(amount / 100).toLocaleString()}
    </Button>
  )
}