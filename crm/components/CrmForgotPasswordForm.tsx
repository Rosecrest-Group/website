"use client";

import { useState } from "react";
import Link from "next/link";
import { requestForgotPassword } from "@/crm/lib/api";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import TextField from "@/crm/components/ui/TextField";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import BodyHeading from "@/crm/components/ui/BodyHeading";
import BodySubtext from "@/crm/components/ui/BodySubtext";
import CrmAuthBrand from "@/crm/components/CrmAuthBrand";

export default function CrmForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestForgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <CurvedContainer className="w-full max-w-md">
        <div className="p-8">
          <CrmAuthBrand />
          <BodyHeading className="text-xl">Reset your password</BodyHeading>
          <BodySubtext className="mt-1">
            {sent
              ? "If an account exists for that email, we sent a reset link."
              : "Enter your email and we'll send you a link to reset your password."}
          </BodySubtext>

          {sent ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-(--color-tc-40)">
                Check your inbox and follow the link in the email. The link expires after a short
                time.
              </p>
              <Link
                href="/crm/login"
                className="inline-block text-sm font-medium text-(--color-primary) hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <PrimaryButton type="submit" disabled={loading} className="w-full">
                {loading ? "Sending…" : "Send reset link"}
              </PrimaryButton>
              <Link
                href="/crm/login"
                className="block text-center text-sm text-(--color-primary) hover:underline"
              >
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </CurvedContainer>
    </div>
  );
}
