import crypto from "node:crypto";

export type SessionUser = {
  email: string;
  role: "admin" | "user";
};

const SESSION_COOKIE = "beauty_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_SIGNUP_CODE || "beauty-dev-secret";
}

function encodePayload(user: SessionUser) {
  return Buffer.from(
    JSON.stringify({
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    }),
  ).toString("base64url");
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function parseCookieHeader(cookieHeader: string | null) {
  return Object.fromEntries(
    (cookieHeader || "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value),
  );
}

export function createSessionCookie(user: SessionUser) {
  const payload = encodePayload(user);
  const token = `${payload}.${sign(payload)}`;

  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function createExpiredSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getSessionUser(request: Request): SessionUser | null {
  const token = parseCookieHeader(request.headers.get("cookie"))[SESSION_COOKIE];
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || signature !== sign(payload)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as
      | (SessionUser & { exp: number })
      | null;

    if (!data?.email || !data.role || data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { email: data.email, role: data.role };
  } catch {
    return null;
  }
}

export function requireAdmin(request: Request) {
  const user = getSessionUser(request);
  if (user?.role === "admin") return null;

  return Response.json(
    { error: "Only admin can change website data." },
    { status: 403 },
  );
}
