import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-dev-secret-change-in-production"
);
const SESSION_COOKIE = "komute_session";
const SESSION_EXPIRY_DAYS = 30;

// ============================================
// JWT HELPERS
// ============================================

interface SessionPayload {
  userId: string;
  phone: string;
  roles: string[];
  isOnboarded: boolean;
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_DAYS}d`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ============================================
// COOKIE MANAGEMENT
// ============================================

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export async function createSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, phone: true, roles: true, isOnboarded: true },
  });

  if (!user) throw new Error("User not found");

  const token = await createSessionToken({
    userId: user.id,
    phone: user.phone,
    roles: user.roles,
    isOnboarded: user.isOnboarded,
  });

  // Store session in DB for server-side validation + revocation
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  await setSessionCookie(token);

  // Update last login
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  return token;
}

export async function getCurrentUser() {
  const token = await getSessionCookie();
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // Validate session still exists in DB (not revoked)
  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session || session.expiresAt < new Date()) {
    await clearSessionCookie();
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      driverProfile: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOnboarded() {
  const user = await requireAuth();
  if (!user.isOnboarded) redirect("/onboarding");
  return user;
}

export async function requireDriver() {
  const user = await requireOnboarded();
  if (!user.roles.includes("DRIVER")) redirect("/rider");
  return user;
}

export async function logout() {
  const token = await getSessionCookie();
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  await clearSessionCookie();
}

// ============================================
// OTP HELPERS
// ============================================

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // 10 min expiry
  return expiry;
}