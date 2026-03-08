"use client"

import { useState } from "react"
import { type App } from "@/lib/apps"
import { ArrowLeft } from "lucide-react"

interface ManagerProfile {
  user_id: string
  email: string
  role: string
  created_at: string
}

interface Permission {
  user_id: string
  app_slug: string
}

interface Props {
  users: ManagerProfile[]
  permissions: Permission[]
  apps: App[]
  currentUserId: string
}

export default function AdminPanel({ users, permissions, apps, currentUserId }: Props) {
  const [permState, setPermState] = useState<Record<string, Set<string>>>(() => {
    const state: Record<string, Set<string>> = {}
    users.forEach(u => { state[u.user_id] = new Set() })
    permissions.forEach(p => { state[p.user_id]?.add(p.app_slug) })
    return state
  })
  const [saving, setSaving] = useState<string | null>(null)

  async function toggle(userId: string, appSlug: string, currentlyGranted: boolean) {
    const key = `${userId}-${appSlug}`
    setSaving(key)
    const res = await fetch("/api/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, appSlug, grant: !currentlyGranted }),
    })
    if (res.ok) {
      setPermState(prev => {
        const next = { ...prev, [userId]: new Set(prev[userId]) }
        if (currentlyGranted) next[userId].delete(appSlug)
        else next[userId].add(appSlug)
        return next
      })
    }
    setSaving(null)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050508", padding: "32px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          <a href="/" style={{ color: "#555", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <ArrowLeft size={14} /> Back
          </a>
          <div style={{ width: "1px", height: "16px", background: "#222" }} />
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "#fff" }}>User Permissions</h1>
            <p style={{ color: "#555", fontSize: "13px", margin: "4px 0 0" }}>Manage which apps each user can access</p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#555", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  User
                </th>
                {apps.map(app => (
                  <th key={app.slug} style={{ textAlign: "center", padding: "12px 8px", color: "#555", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", minWidth: "100px" }}>
                    {app.name.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "16px", verticalAlign: "middle" }}>
                    <div>
                      <div style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>{u.email}</div>
                      <div style={{ color: u.role === "admin" ? "#8ceb4c" : "#555", fontSize: "11px", marginTop: "2px", textTransform: "capitalize" }}>{u.role}</div>
                    </div>
                  </td>
                  {apps.map(app => {
                    const granted = u.role === "admin" || permState[u.user_id]?.has(app.slug)
                    const key = `${u.user_id}-${app.slug}`
                    const isAdmin = u.role === "admin"
                    return (
                      <td key={app.slug} style={{ textAlign: "center", padding: "16px 8px" }}>
                        <button
                          onClick={() => !isAdmin && toggle(u.user_id, app.slug, permState[u.user_id]?.has(app.slug) ?? false)}
                          disabled={isAdmin || saving === key}
                          title={isAdmin ? "Admins have full access" : undefined}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "6px",
                            border: granted ? "1px solid rgba(140,235,76,0.4)" : "1px solid rgba(255,255,255,0.12)",
                            background: granted ? "rgba(140,235,76,0.15)" : "rgba(255,255,255,0.04)",
                            cursor: isAdmin ? "default" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            opacity: saving === key ? 0.5 : 1,
                            transition: "all 0.15s",
                          }}
                        >
                          {granted ? "✓" : ""}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
