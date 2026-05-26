import { requestJson } from "@/src/api/http";

type User = { email: string; role: "admin" | "user" };

export function signupAccount(payload: {
  email: string;
  password: string;
  adminCode?: string;
}) {
  return requestJson<{ user: User }>("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function signinAccount(payload: { email: string; password: string }) {
  return requestJson<{ user: User }>("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function signoutAccount() {
  return requestJson<{ ok: boolean }>("/api/auth/signout", { method: "POST" });
}
