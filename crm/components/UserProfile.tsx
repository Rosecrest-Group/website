"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import { api } from "@/crm/lib/api";
import { USER_ROLE_OPTIONS } from "@/crm/lib/constants";
import type { ApiUser } from "@/crm/types";
import { toast } from "sonner";

function userInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function roleLabel(role: ApiUser["role"]) {
  return USER_ROLE_OPTIONS.find((opt) => opt.value === role)?.label ?? role;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

export default function UserProfile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    api
      .getMe()
      .then((me) => {
        setUser(me);
        setFullName(me.fullName);
        setPhone(me.phone ?? "");
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    try {
      const updated = await api.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
      });
      setUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const image = await fileToDataUrl(file);
      const updated = await api.uploadAvatar(image);
      setUser(updated);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    setUploadingAvatar(true);
    try {
      const updated = await api.removeAvatar();
      setUser(updated);
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove photo");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="My profile"
        subtitle="Update your photo, contact details, and password."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CrmPanel title="Profile photo">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="size-20">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              ) : null}
              <AvatarFallback className="bg-(--color-primary) text-lg font-semibold text-white">
                {user ? userInitials(user.fullName) : "·"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <PrimaryButton
                type="button"
                className="w-auto"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingAvatar ? "Uploading…" : "Upload photo"}
              </PrimaryButton>
              {user?.avatarUrl ? (
                <SecondaryButton
                  type="button"
                  className="w-auto"
                  disabled={uploadingAvatar}
                  onClick={handleRemoveAvatar}
                >
                  Remove photo
                </SecondaryButton>
              ) : null}
              <p className="text-xs text-(--color-tc-30)">JPEG, PNG, WebP, or GIF. Max 2MB.</p>
            </div>
          </div>
        </CrmPanel>

        <CrmPanel title="Account details">
          <form className="space-y-4" onSubmit={saveProfile}>
            <TextField
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <TextField
              label="Email"
              value={user?.email ?? ""}
              readOnly
              className="bg-(--color-nc-10) text-(--color-tc-30)"
            />
            <TextField
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 07400 000000"
            />
            <p className="text-xs text-(--color-tc-30)">
              Optional contact number for your profile. Outbound calls use Dialpad in the CRM sidebar.
            </p>
            <TextField
              label="Role"
              value={user ? roleLabel(user.role) : ""}
              readOnly
              className="bg-(--color-nc-10) text-(--color-tc-30)"
            />
            <PrimaryButton type="submit" className="w-auto" disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save changes"}
            </PrimaryButton>
          </form>
        </CrmPanel>

        <CrmPanel title="Password">
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <TextField
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <PrimaryButton type="submit" className="w-auto" disabled={changingPassword}>
              {changingPassword ? "Updating…" : "Update password"}
            </PrimaryButton>
          </form>
        </CrmPanel>

        {user?.twoFAEnabled ? (
          <CrmPanel title="Two-factor authentication">
            <p className="text-sm text-(--color-tc-30)">
              Two-factor authentication is enabled on your account.
            </p>
          </CrmPanel>
        ) : null}
      </div>
    </CrmPageContent>
  );
}
