"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "admin_session";
const CLIENT_HINT_COOKIE_NAME = "admin_logged_in";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || "rizzmed-default-auth-secret-key-2026";
}

function generateToken(): string {
  const expiry = Date.now() + SESSION_DURATION_MS;
  const payload = `${expiry}:admin`;
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("hex");
  return `${payload}:${signature}`;
}

function verifyToken(token: string): boolean {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;
    const [expiryStr, user, signature] = parts;
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;
    if (user !== "admin") return false;

    const expectedSignature = crypto
      .createHmac("sha256", getSecretKey())
      .update(`${expiryStr}:${user}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "rizzmed2026";

  if (username === validUsername && password === validPassword) {
    const token = generateToken();
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set(CLIENT_HINT_COOKIE_NAME, "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  }

  return { success: false, error: "Username atau password salah" };
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(CLIENT_HINT_COOKIE_NAME);
  return { success: true };
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!session) return false;
  return verifyToken(session);
}
