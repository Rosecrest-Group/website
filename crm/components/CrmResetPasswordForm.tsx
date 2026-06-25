"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/crm/lib/api";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import TextField from "@/crm/components/ui/TextField";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import BodyHeading from "@/crm/components/ui/BodyHeading";
import BodySubtext from "@/crm/components/ui/BodySubtext";

function parseRecoveryTokens(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const type = params.get("type");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (type !== "recovery" || !accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export default function CrmResetPasswordForm() {
  const router = useRouter();
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const parsed = parseRecoveryTokens(window.location.hash);
    setTokens(parsed);
    if (!parsed) {
      setError("This reset link is invalid or has expired. Request a new one.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tokens) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await resetPassword(tokens.accessToken, tokens.refreshToken, password);
      setDone(true);
      window.history.replaceState(null, "", window.location.pathname);
      setTimeout(() => router.push("/crm/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <CurvedContainer className="w-full max-w-md">
        <div className="p-8">
          <BodyHeading className="text-xl">Choose a new password</BodyHeading>
          <BodySubtext className="mt-1">
            {done
              ? "Your password has been updated. Redirecting to sign in…"
              : "Enter a new password for your Rosecrest CRM account."}
          </BodySubtext>

          {done ? (
            <div className="mt-6">
              <Link
                href="/crm/login"
                className="text-sm font-medium text-(--color-primary) hover:underline"
              >
                Sign in now
              </Link>
            </div>
          ) : tokens ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <TextField
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <TextField
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <PrimaryButton type="submit" disabled={loading} className="w-full">
                {loading ? "Updating…" : "Update password"}
              </PrimaryButton>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Link
                href="/crm/forgot-password"
                className="text-sm font-medium text-(--color-primary) hover:underline"
              >
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </CurvedContainer>
    </div>
  );
}
