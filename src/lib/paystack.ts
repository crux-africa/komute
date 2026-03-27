// Paystack Payment Integration
// Transaction verification

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackVerificationResponse {
  success: boolean;
  data?: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    customer: {
      id: number;
      email: string;
    };
  };
  error?: string;
}

export async function verifyPaystackTransaction(
  reference: string,
  expectedAmount: number
): Promise<PaystackVerificationResponse> {
  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || `HTTP ${response.status}`,
      };
    }

    if (!result.status) {
      return {
        success: false,
        error: result.message || "Transaction verification failed",
      };
    }

    const data = result.data;

    // Check if transaction was successful
    if (data.status !== "success") {
      return {
        success: false,
        data,
        error: `Transaction status: ${data.status}`,
      };
    }

    // Verify amount matches (Paystack returns amount in kobo)
    if (data.amount !== expectedAmount) {
      return {
        success: false,
        data,
        error: `Amount mismatch: expected ${expectedAmount}, got ${data.amount}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Transaction verification failed",
    };
  }
}
