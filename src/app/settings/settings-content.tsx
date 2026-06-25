"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { DeleteAccountConfirmation } from "@/components/profile/delete-account-confirmation"
import { EditorPreferencesForm } from "@/components/settings/editor-preferences-form"
import type { UserProfile } from "@/lib/db/users"
import type { EditorPreferences } from "@/lib/editor-preferences"

export function SettingsContent({ profile, editorPrefs }: { profile: UserProfile; editorPrefs: EditorPreferences }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
