"use client"

import { useState } from "react"
import { type App, CLIENTS } from "@/lib/apps"
import { ArrowLeft, Plus, Trash2, Building2 } from "lucide-react"

interface ManagerProfile {
  user_id: string
  email: string
  role: string
  client?: string
  rep_type?: string
  created_at: string
}

interface Permission {
  user_id: string
  app_slug: string
}

interface Client {
  id: string
  name: string
  created_at: string
}

interface Props {
  users: ManagerProfile[]
  permissions: Permission[]
  apps: App[]
  clients: Client[]
  currentUserId: string
}

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'sales_rep', label: 'Sales Rep' },
  { value: 'client', label: 'Client' },
]

const ROLE_COLORS: Record<string, string> = {
  admin: '#8ceb4c',
  manager: '#2d62ff',
  sales_rep: '#ff5d00',
  client: '#a78bfa',
}

export default function AdminPanel({ users, permissions, apps, clients: initialClients, currentUserId }: Props) {
  const [permState, setPermState] = useState<Record<string, Set<string>>>(() => {
    const state: Record<string, Set<string>> = {}
    users.forEach(u => { state[u.user_id] = new Set() })
    permissions.forEach(p => { state[p.user_id]?.add(p.app_slug) })
    return state
  })
  const [saving, setSaving] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("manager")
  const [inviteClient, setInviteClient] = useState("")
  const [inviteRepType, setInviteRepType] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [localUsers, setLocalUsers] = useState(users)
  const [clientList, setClientList] = useState(initialClients)
  const [newClientName, setNewClientName] = useState("")
  const [addingClient, setAddingClient] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

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

  async function handleUpdateRepType(userId: string, rep_type: string) {
    setLocalUsers(prev => prev.map(u => u.user_id === userId ? { ...u, rep_type: rep_type || undefined } : u))
    await fetch("/api/admin/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, rep_type: rep_type || null }),
    })
  }

  async function handleUpdateClient(userId: string, client: string) {
    setLocalUsers(prev => prev.map(u => u.user_id === userId ? { ...u, client: client || undefined } : u))
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, client }),
    })
  }

  async function handleDeleteUser(userId: string, email: string) {
    if (!confirm(`Remove ${email}? This will revoke their access.`)) return
    setLocalUsers(prev => prev.filter(u => u.user_id !== userId))
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault()
    if (!newClientName.trim()) return
    setAddingClient(true)
    setClientError(null)
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClientName.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setClientError(data.error || "Failed to add client")
    } else {
      setClientList(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewClientName("")
    }
    setAddingClient(false)
  }

  async function handleDeleteClient(id: string) {
    setClientList(prev => prev.filter(c => c.id !== id))
    await fetch("/api/clients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(null)

    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail.trim(),
        role: inviteRole,
        client: inviteRole === 'sales_rep' ? inviteClient : null,
        rep_type: inviteRole === 'sales_rep' ? inviteRepType : null,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      setInviteError(data.error || "Failed to invite user")
    } else {
      setInviteSuccess(`✓ ${inviteEmail} added — temp password: TempPass2026!`)
      setLocalUsers(prev => [...prev, {
        user_id: data.userId,
        email: inviteEmail.trim(),
        role: inviteRole,
        client: inviteRole === 'sales_rep' ? inviteClient : undefined,
        rep_type: inviteRole === 'sales_rep' ? inviteRepType : undefined,
        created_at: new Date().toISOString()
      }])
      setPermState(prev => ({ ...prev, [data.userId]: new Set() }))
      setInviteEmail("")
      setInviteClient("")
    }
    setInviting(false)
  }

  const inputStyle = {
    padding: "10px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  } as React.CSSProperties

  return (
    <div style={{ minHeight: "100vh", background: "#050508", padding: "32px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          <a href="/" style={{ color: "#555", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <ArrowLeft size={14} /> Back
          </a>
          <div style={{ width: "1px", height: "16px", background: "#222" }} />
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "#fff" }}>Settings</h1>
            <p style={{ color: "#555", fontSize: "13px", margin: "4px 0 0" }}>Manage users and app access</p>
          </div>
        </div>

        {/* Invite User */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: "0 0 16px" }}>Invite User</h2>
          <form onSubmit={handleInvite} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <input
              type="email"
              placeholder="user@systemizedsales.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
              style={{ ...inputStyle, flex: "1", minWidth: "200px" }}
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              style={{ ...inputStyle, minWidth: "130px" }}
            >
              {ROLE_OPTIONS.map(r => (
                <option key={r.value} value={r.value} style={{ background: "#111" }}>{r.label}</option>
              ))}
            </select>

            {inviteRole === 'sales_rep' && (
              <select
                value={inviteClient}
                onChange={e => setInviteClient(e.target.value)}
                required={inviteRole === 'sales_rep'}
                style={{ ...inputStyle, minWidth: "160px" }}
              >
                <option value="" style={{ background: "#111" }}>Select client...</option>
                {clientList.map(c => (
                  <option key={c.name} value={c.name} style={{ background: "#111" }}>{c.name}</option>
                ))}
              </select>
            )}

            {inviteRole === 'sales_rep' && (
              <select
                value={inviteRepType}
                onChange={e => setInviteRepType(e.target.value)}
                required={inviteRole === 'sales_rep'}
                style={{ ...inputStyle, minWidth: "130px" }}
              >
                <option value="" style={{ background: "#111" }}>Rep type...</option>
                <option value="closer" style={{ background: "#111" }}>Closer</option>
                <option value="setter" style={{ background: "#111" }}>Setter</option>
              </select>
            )}

            <button
              type="submit"
              disabled={inviting}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #2d62ff, #2d40ea)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: inviting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={14} />
              {inviting ? "Adding..." : "Add User"}
            </button>
          </form>
          {inviteError && <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#ff5d00" }}>{inviteError}</p>}
          {inviteSuccess && <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#8ceb4c" }}>{inviteSuccess}</p>}
        </div>

        {/* Clients */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Building2 size={16} color="#2d62ff" />
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: 0 }}>Clients</h2>
          </div>
          <form onSubmit={handleAddClient} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Client name (e.g. Woobie)"
              value={newClientName}
              onChange={e => setNewClientName(e.target.value)}
              required
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="submit"
              disabled={addingClient}
              style={{
                padding: "10px 16px",
                background: "linear-gradient(135deg, #2d62ff, #2d40ea)",
                border: "none", borderRadius: "8px",
                color: "#fff", fontSize: "14px", fontWeight: 600,
                cursor: addingClient ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap",
              }}
            >
              <Plus size={14} /> {addingClient ? "Adding..." : "Add Client"}
            </button>
          </form>
          {clientError && <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#ff5d00" }}>{clientError}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {clientList.map(c => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(45,98,255,0.08)", border: "1px solid rgba(45,98,255,0.2)",
                borderRadius: "8px", padding: "6px 12px",
              }}>
                <span style={{ color: "#fff", fontSize: "13px" }}>{c.name}</span>
                <button
                  onClick={() => handleDeleteClient(c.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#555" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {clientList.length === 0 && <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>No clients yet</p>}
          </div>
        </div>

        {/* Permissions Table */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: "0 0 20px" }}>App Access</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 16px", color: "#555", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>User</th>

                  <th style={{ textAlign: "left", padding: "10px 8px", color: "#555", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Account</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", color: "#555", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", minWidth: "110px" }}>Role</th>
                  {apps.map(app => (
                    <th key={app.slug} style={{ textAlign: "center", padding: "10px 8px", color: "#555", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", minWidth: "80px" }}>
                      {app.name.split(" ")[0]}
                    </th>
                  ))}
                  <th style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", width: "48px" }}></th>
                </tr>
              </thead>
              <tbody>
                {localUsers.map(u => (
                  <tr key={u.user_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                      <div>
                        <div style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>{u.email}</div>
                        <div style={{ color: ROLE_COLORS[u.role] ?? "#555", fontSize: "11px", marginTop: "2px", textTransform: "capitalize" }}>
                          {u.role.replace('_', ' ')}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 8px", verticalAlign: "middle" }}>
                      {(u.role === 'sales_rep' || u.role === 'client') ? (
                        <select
                          value={u.client || ""}
                          onChange={e => handleUpdateClient(u.user_id, e.target.value)}
                          style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: u.client ? "#fff" : "#555", fontSize: "12px", padding: "4px 8px", cursor: "pointer", outline: "none", minWidth: "120px" }}
                        >
                          <option value="" style={{ background: "#111" }}>— none —</option>
                          {clientList.map(c => (
                            <option key={c.name} value={c.name} style={{ background: "#111" }}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ color: "#444", fontSize: "12px" }}>Internal</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 8px", verticalAlign: "middle" }}>
                      {u.role === "sales_rep" ? (
                        <select
                          value={u.rep_type || ""}
                          onChange={e => handleUpdateRepType(u.user_id, e.target.value)}
                          style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: u.rep_type ? "#fff" : "#555", fontSize: "12px", padding: "4px 8px", cursor: "pointer", outline: "none", minWidth: "100px" }}
                        >
                          <option value="" style={{ background: "#111" }}>— none —</option>
                          <option value="closer" style={{ background: "#111" }}>Closer</option>
                          <option value="setter" style={{ background: "#111" }}>Setter</option>
                        </select>
                      ) : (
                        <span style={{ color: "#444", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                    {apps.map(app => {
                      const isAdmin = u.role === "admin"
                      const granted = isAdmin || permState[u.user_id]?.has(app.slug)
                      const key = `${u.user_id}-${app.slug}`
                      return (
                        <td key={app.slug} style={{ textAlign: "center", padding: "14px 8px" }}>
                          <button
                            onClick={() => !isAdmin && toggle(u.user_id, app.slug, permState[u.user_id]?.has(app.slug) ?? false)}
                            disabled={isAdmin || saving === key}
                            title={isAdmin ? "Admins have full access" : undefined}
                            style={{
                              width: "26px", height: "26px",
                              borderRadius: "6px",
                              border: granted ? "1px solid rgba(140,235,76,0.4)" : "1px solid rgba(255,255,255,0.1)",
                              background: granted ? "rgba(140,235,76,0.15)" : "rgba(255,255,255,0.04)",
                              cursor: isAdmin ? "default" : "pointer",
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              color: granted ? "#8ceb4c" : "#444",
                              fontSize: "14px", fontWeight: 700,
                              opacity: saving === key ? 0.5 : 1,
                              transition: "all 0.15s",
                            }}
                          >
                            {granted ? "✓" : ""}
                          </button>
                        </td>
                      )
                    })}
                  <td style={{ padding: "14px 8px", textAlign: "center", verticalAlign: "middle" }}>
                    <button
                      onClick={() => handleDeleteUser(u.user_id, u.email)}
                      title="Remove user"
                      style={{ background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.25)", borderRadius: "6px", cursor: "pointer", color: "#ff6666", padding: "5px 7px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
