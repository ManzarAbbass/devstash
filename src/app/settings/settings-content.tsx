"use client"

import { useState } from "react"
import { Trash2, Crown } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { DeleteAccountConfirmation } from "@/components/profile/delete-account-confirmation"
import { EditorPreferencesForm } from "@/components/settings/editor-preferences-form"
import type { UserProfile } from "@/lib/db/users"
import type { EditorPreferences } from "@/lib/editor-preferences"

export function SettingsContent({ profile, editorPrefs, monthlyPriceId, yearlyPriceId, currentPlan }: {
  profile: UserProfile
  editorPrefs: EditorPreferences
  monthlyPriceId: string
  yearlyPriceId: string
  currentPlan: "monthly" | "yearly" | null
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [yearly, setYearly] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  async function handleCheckout() {
    setCheckoutLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: yearly ? yearlyPriceId : monthlyPriceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }
      window.location.href = data.url
    } catch {
      toast.error("Something went wrong")
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }
      window.location.href = data.url
    } catch {
      toast.error("Something went wrong")
    } finally {
      setPortalLoading(false)
    }
  }

  const handleDeleteAccount = async (password?: string) => {
    try {
      const res = await fetch("/api/profile/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }
      toast.success("Account deleted")
      await signOut({ callbackUrl: "/sign-in" })
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <EditorPreferencesForm initial={editorPrefs} />

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            {profile.isPro
              ? <>You're on the DevStash <span className="inline-flex items-center rounded-md bg-purple-600 px-1.5 py-0.5 text-xs font-semibold text-white">Pro</span> plan{currentPlan ? ` (${currentPlan === "yearly" ? "Yearly" : "Monthly"})` : ""}.</>
              : "You're on the Free plan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile.isPro ? (
            <Button onClick={handlePortal} disabled={portalLoading}>
              <Crown className="size-4" />
              {portalLoading ? "Loading..." : "Manage Subscription"}
            </Button>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for unlimited items, collections, file uploads, and AI features.
              </p>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${yearly ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                  ${yearly ? "72" : "8"}<span className="text-xs text-muted-foreground font-normal">{yearly ? "/yr" : "/mo"}</span>
                </span>
                <label className="relative inline-block h-6 w-[44px]">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={yearly}
                    onChange={(e) => setYearly(e.target.checked)}
                  />
                  <span className="absolute inset-0 cursor-pointer rounded-full bg-muted transition-colors peer-checked:bg-blue-500" />
                  <span className="absolute left-0.5 bottom-0.5 size-5 rounded-full bg-white transition-all peer-checked:translate-x-[22px]" />
                </label>
                <span className={`text-sm ${yearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  ${yearly ? "6" : "8"}<span className="text-xs text-muted-foreground font-normal">/mo</span>
                  {yearly && <span className="ml-1 text-[11px] font-semibold text-green-500">Save 25%</span>}
                </span>
              </div>
              <Button onClick={handleCheckout} disabled={checkoutLoading} className="w-fit">
                <Crown className="size-4" />
                {checkoutLoading ? "Loading..." : `Upgrade to Pro - $${yearly ? "72" : "8"}/${yearly ? "yr" : "mo"}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {profile.hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          {showDeleteConfirm ? (
            <DeleteAccountConfirmation
              onConfirm={handleDeleteAccount}
              onCancel={() => setShowDeleteConfirm(false)}
              hasPassword={profile.hasPassword}
            />
          ) : (
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="size-4" />
              Delete Account
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
