"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { Building2, Lock, LogOut, User } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const business = useAuthStore((s) => s.business);

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [saved, setSaved] = useState(false);

  const profileMutation = useMutation({
    mutationFn: async () => {
      await api.patch(API_ROUTES.AUTH.ME, {
        full_name: fullName,
        current_password: currentPwd || undefined,
        new_password: newPwd || undefined,
      });
    },
    onSuccess: () => {
      setSaved(true);
      setCurrentPwd("");
      setNewPwd("");
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleLogout = async () => {
    await authService.logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Settings" description="Manage your account and business" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Profile Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="h-4 w-4 text-primary" />
              <h2 className="text-[15px] font-semibold text-foreground">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="h-4 w-4 text-primary" />
              <h2 className="text-[15px] font-semibold text-foreground">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Current Password</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">New Password</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Min. 8 chars with uppercase + number"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="text-[15px] font-semibold text-foreground">Business</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">Business Name</span>
                <span className="text-sm font-medium text-foreground">{business?.name ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">GSTIN</span>
                <span className="text-sm font-mono text-foreground">{business?.gstin ?? "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium text-primary capitalize">{user?.role ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Save / Logout */}
          <div className="flex items-center justify-between">
            <Button
              id="settings-save"
              onClick={() => profileMutation.mutate()}
              disabled={profileMutation.isPending}
              className="gap-2"
            >
              {profileMutation.isPending ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
            </Button>

            <Button
              id="settings-logout"
              variant="ghost"
              onClick={handleLogout}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {profileMutation.isError && (
            <p className="text-sm text-destructive">Failed to save changes. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
