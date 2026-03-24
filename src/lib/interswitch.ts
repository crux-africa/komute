const ISW_BASE_URL = "https://qa.interswitchng.com"
// LIVE: "https://webpay.interswitchng.com"

interface TransactionStatus {
  Amount: number
  CardNumber: string
  MerchantReference: string
  PaymentReference: string
  RetrievalReferenceNumber: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SplitAccounts: any[]
  TransactionDate: string
  ResponseCode: string
  ResponseDescription: string
  AccountNumber: string
}

/**
 * Verify a transaction with Interswitch's server.
 * Call this BEFORE confirming a booking.
 */
export async function verifyTransaction(
  transactionRef: string,
  expectedAmount: number
): Promise<{
  success: boolean
  data?: TransactionStatus
  error?: string
}> {
  try {
    const merchantCode = process.env.NEXT_PUBLIC_ISW_MERCHANT_CODE
    const url = `${ISW_BASE_URL}/collections/api/v1/gettransaction.json?merchantcode=${merchantCode}&transactionreference=${transactionRef}&amount=${expectedAmount}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const data: TransactionStatus = await response.json()

    // Check response code: "00" = Approved
    if (data.ResponseCode !== "00") {
      return {
        success: false,
        data,
        error: data.ResponseDescription || "Transaction not approved",
      }
    }

    // CRITICAL: Verify the amount matches what we expect
    if (data.Amount !== expectedAmount) {
      return {
        success: false,
        data,
        error: `Amount mismatch: expected ${expectedAmount}, got ${data.Amount}`,
      }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    }
  }
}