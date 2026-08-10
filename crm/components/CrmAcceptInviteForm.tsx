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

function parseInviteTokens(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const type = params.get("type");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  // invite = first-time invite; recovery = re-invite / existing Auth user
  if ((type !== "invite" && type !== "recovery") || !accessToken || !refreshToken) {
    return null;
  }
  return { accessToken, refreshToken };
}

export default function CrmAcceptInviteForm() {
  const router = useRouter();
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const parsed = parseInviteTokens(window.location.hash);
    setTokens(parsed);
    if (!parsed) {
      setError("This invite link is invalid or has expired. Ask a Super Admin to send a new invite.");
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
      setError(err instanceof Error ? err.message : "Could not set up your account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <CurvedContainer className="w-full max-w-md">
        <div className="p-8">
          <BodyHeading className="text-xl">Set up your account</BodyHeading>
          <BodySubtext className="mt-1">
            {done
              ? "Your account is ready. Redirecting to sign in…"
              : "Choose a password to join the Rosecrest CRM."}
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
                label="Password"
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
                {loading ? "Setting up…" : "Create password & continue"}
              </PrimaryButton>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Link
                href="/crm/login"
                className="text-sm font-medium text-(--color-primary) hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </CurvedContainer>
    </div>
  );
}
