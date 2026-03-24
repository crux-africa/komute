// ============================================
// Interswitch API Integration
// Token management + Identity verification
// ============================================

const ISW_MARKETPLACE_BASE =
  "https://api-marketplace-routing.k8.isw.la/marketplace-routing/api/v1";
const ISW_PASSPORT_URL =
  "https://qa.interswitchng.com/passport/oauth/token";
// LIVE passport: "https://interswitchng.com/passport/oauth/token"

const ISW_PAYMENT_SANDBOX = "https://qa.interswitchng.com";
// LIVE payment: "https://webpay.interswitchng.com"

// ============================================
// TOKEN MANAGEMENT
// ============================================

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAccessToken(): Promise<string> {
  // Return cached token if valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  const clientId = process.env.ISW_CLIENT_ID!;
  const secretKey = process.env.ISW_SECRET_KEY!;
  const credentials = Buffer.from(`${clientId}:${secretKey}`).toString(
    "base64"
  );

  const response = await fetch(ISW_PASSPORT_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Interswitch token request failed (${response.status}): ${error}`
    );
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return cachedToken!;
}

// ============================================
// GENERIC MARKETPLACE IDENTITY CALL
// ============================================

interface ISWIdentityResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  rawResponse?: Record<string, unknown>;
}

async function callIdentityAPI(
  path: string,
  body: Record<string, unknown>
): Promise<ISWIdentityResponse> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${ISW_MARKETPLACE_BASE}/verify/identity/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          data.message || data.responseCode || `HTTP ${response.status}`,
        rawResponse: data,
      };
    }

    return {
      success: true,
      data,
      rawResponse: data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Identity API call failed",
    };
  }
}

// ============================================
// IDENTITY VERIFICATION APIs
// ============================================

export async function verifyNIN(nin: string): Promise<ISWIdentityResponse> {
  return callIdentityAPI("nin", { id: nin });
}

export async function verifyNINFullDetails(
  nin: string
): Promise<ISWIdentityResponse> {
  return callIdentityAPI("nin/verify", { id: nin });
}

export async function verifyBVNFullDetails(
  bvn: string
): Promise<ISWIdentityResponse> {
  return callIdentityAPI("bvn/verify", { id: bvn });
}

export async function verifyDriversLicense(
  licenseNumber: string
): Promise<ISWIdentityResponse> {
  return callIdentityAPI("driver-license", { id: licenseNumber });
}

export async function verifyBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<ISWIdentityResponse> {
  return callIdentityAPI("bank-account", {
    id: accountNumber,
    bankCode,
  });
}

export async function compareFaces(
  image1Base64: string,
  image2Base64: string
): Promise<ISWIdentityResponse> {
  return callIdentityAPI("face-comparison", {
    image1: image1Base64,
    image2: image2Base64,
  });
}

export async function verifyPhysicalAddress(
  address: string
): Promise<ISWIdentityResponse> {
  return callIdentityAPI("address", { id: address });
}

export async function lookupBankAccounts(
  bvn: string
): Promise<ISWIdentityResponse> {
  return callIdentityAPI("bvn-accounts", { id: bvn });
}

// ============================================
// WHATSAPP OTP
// ============================================

export async function sendWhatsAppOTP(
  phoneNumber: string
): Promise<ISWIdentityResponse> {
  return callIdentityAPI("whatsapp", { id: phoneNumber });
}

// ============================================
// PAYMENT VERIFICATION (Web Checkout)
// ============================================

interface TransactionVerification {
  success: boolean;
  data?: {
    Amount: number;
    ResponseCode: string;
    ResponseDescription: string;
    MerchantReference: string;
    PaymentReference: string;
    TransactionDate: string;
    RetrievalReferenceNumber: string;
  };
  error?: string;
}

export async function verifyTransaction(
  transactionRef: string,
  expectedAmount: number
): Promise<TransactionVerification> {
  try {
    const merchantCode = process.env.NEXT_PUBLIC_ISW_MERCHANT_CODE;
    const url = `${ISW_PAYMENT_SANDBOX}/collections/api/v1/gettransaction.json?merchantcode=${merchantCode}&transactionreference=${transactionRef}&amount=${expectedAmount}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();

    if (data.ResponseCode !== "00") {
      return {
        success: false,
        data,
        error:
          data.ResponseDescription || "Transaction not approved",
      };
    }

    if (data.Amount !== expectedAmount) {
      return {
        success: false,
        data,
        error: `Amount mismatch: expected ${expectedAmount}, got ${data.Amount}`,
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

// ============================================
// SEND MONEY (Driver Payouts)
// ============================================

interface TransferResult {
  success: boolean;
  transactionRef?: string;
  error?: string;
  rawResponse?: Record<string, unknown>;
}

export async function sendMoney(params: {
  amount: number; // in kobo
  accountNumber: string;
  bankCode: string;
  senderName: string;
  senderPhone: string;
  beneficiaryName: string;
}): Promise<TransferResult> {
  try {
    const token = await getAccessToken();

    const transferCode = `KMT${Date.now()}`;

    // MAC = sha512 of concatenated values
    const macString = `${params.amount}566AC${params.amount}566ACNG`;

    const { createHash } = await import("crypto");
    const mac = createHash("sha512")
      .update(macString)
      .digest("hex");

    const response = await fetch(
      `${ISW_PAYMENT_SANDBOX}/quicktellerservice/api/v5/transactions/TransferFunds`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          terminalId: "3PBL0001",
        },
        body: JSON.stringify({
          transferCode,
          mac,
          termination: {
            amount: String(params.amount),
            accountReceivable: {
              accountNumber: params.accountNumber,
              accountType: "00",
            },
            entityCode: params.bankCode,
            currencyCode: "566",
            paymentMethodCode: "AC",
            countryCode: "NG",
          },
          sender: {
            phone: params.senderPhone,
            lastname: params.senderName.split(" ").pop() || "",
            othernames: params.senderName.split(" ").shift() || "",
          },
          initiatingEntityCode: "PBL",
          initiation: {
            amount: String(params.amount),
            currencyCode: "566",
            paymentMethodCode: "CA",
            channel: "7",
          },
          beneficiary: {
            lastname: params.beneficiaryName.split(" ").pop() || "",
            othernames:
              params.beneficiaryName.split(" ").shift() || "",
          },
        }),
      }
    );

    const data = await response.json();

    if (
      data.ResponseCode === "90000" ||
      data.ResponseCodeGrouping === "SUCCESSFUL"
    ) {
      return {
        success: true,
        transactionRef: data.TransactionReference || transferCode,
        rawResponse: data,
      };
    }

    return {
      success: false,
      error: data.ResponseCode || "Transfer failed",
      rawResponse: data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Transfer failed",
    };
  }
}

// ============================================
// ACCOUNT NAME INQUIRY (Validate bank details)
// ============================================

export async function validateBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<{
  success: boolean;
  accountName?: string;
  error?: string;
}> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${ISW_PAYMENT_SANDBOX}/quicktellerservice/api/v5/transactions/DoAccountNameInquiry`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          TerminalId: "3PBL0001",
          bankCode,
          accountId: accountNumber,
        },
      }
    );

    const data = await response.json();

    if (
      data.ResponseCode === "90000" ||
      data.ResponseCodeGrouping === "SUCCESSFUL"
    ) {
      return {
        success: true,
        accountName: data.AccountName,
      };
    }

    return {
      success: false,
      error: data.ResponseCode || "Account inquiry failed",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Account inquiry failed",
    };
  }
}