"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/crm/lib/api";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import TextField from "@/crm/components/ui/TextField";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import BodyHeading from "@/crm/components/ui/BodyHeading";
import BodySubtext from "@/crm/components/ui/BodySubtext";
import CrmAuthBrand from "@/crm/components/CrmAuthBrand";

export default function CrmLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password, keepSignedIn);
      if (data.user && !data.requires2fa) {
        const { seedCurrentUser } = await import("@/crm/lib/currentUserCache");
        seedCurrentUser(data.user);
      }
      const redirect = searchParams.get("redirect") ?? "/crm";
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <CurvedContainer className="w-full max-w-md">
        <div className="p-8">
          <CrmAuthBrand />
          <BodyHeading className="text-xl">Sign in</BodyHeading>
          <BodySubtext className="mt-1">Access the Rosecrest operations platform</BodySubtext>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-(--color-tc-40)">Password</span>
                <Link
                  href="/crm/forgot-password"
                  className="text-sm text-(--color-primary) hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <TextField
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-tc-30) hover:text-(--color-tc-40)"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-(--color-tc-40)">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="size-4 rounded border-(--color-tc-20) accent-(--color-primary)"
              />
              Keep me signed in
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <PrimaryButton
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in…" : "Sign in"}
            </PrimaryButton>
          </form>
        </div>
      </CurvedContainer>
    </div>
  );
}
