"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const auth = useAuth();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = await auth.signup(email.trim(), password, adminCode.trim());
    if (!result.ok) {
      setError(result.error || "Email already in use");
      return;
    }
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded border px-3 py-2"
            />
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="rounded border px-3 py-2"
            />
            <input
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Admin code (optional)"
              className="rounded border px-3 py-2"
            />
            {error ? <div className="text-red-600">{error}</div> : null}
            <div className="flex justify-end">
              <button className="rounded bg-pink-700 px-4 py-2 text-white">
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
