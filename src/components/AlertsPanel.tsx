"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Bell, BellOff, Edit3, X, Save } from "lucide-react"

interface Alert {
  id: string
  client: string
  title: string
  message: string
  target_role: string
  frequency: string
  send_day: string | null
  send_time: string
  active: boolean
  last_sent_at: string | null
  created_by: string | null
  created_at: string
}

interface Client {
  name: string
}

const ROLES = [
  { value: "closer", label: "Closers" },
  { value: "setter", label: "Setters" },
  { value: "client", label: "Clients" },
  { value: "all", label: "All" },
]

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "once", label: "One-time" },
]

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const ROLE_COLORS: Record<string, string> = {
  closer: "#8ceb4c",
  setter: "#2d62ff",
  client: "#a78bfa",
  all: "#eab308",
}

export default function AlertsPanel({ clients }: { clients: Client[] }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filterClient, setFilterClient] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Create form state
  const [form, setForm] = useState({
    client: "",
    title: "",
    message: "",
    target_role: "closer",
    frequency: "weekly",
    send_day: "monday",
    send_time: "09:00",
    send_month_day: "1",
    link_url: "",
    link_label: "",
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  async function fetchAlerts() {
    const res = await fetch("/api/alerts")
    const data = await res.json()
    setAlerts(data)
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      send_day: form.frequency === "weekly" ? form.send_day : null,
      send_month_day: form.frequency === "monthly" ? form.send_month_day : null,
    }
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) {
      setAlerts(prev => [data, ...prev])
      setShowCreate(false)
      setForm({ client: "", title: "", message: "", target_role: "closer", frequency: "weekly", send_day: "monday", send_time: "09:00", send_month_day: "1", link_url: "", link_label: "" })
    }
  }

  async function toggleActive(alert: Alert) {
    const res = await fetch(`/api/alerts/${alert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !alert.active }),
    })
    if (res.ok) {
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: !a.active } : a))
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" })
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  async function handleSaveEdit(alert: Alert) {
    const res = await fetch(`/api/alerts/${alert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: alert.title,
        message: alert.message,
        target_role: alert.target_role,
        frequency: alert.frequency,
        send_day: alert.frequency === "weekly" ? alert.send_day : null,
        send_time: alert.send_time,
      }),
    })
    if (res.ok) setEditingId(null)
  }

  const filtered = filterClient
    ? alerts.filter(a => a.client === filterClient)
    : alerts

  const inputStyle = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "13px",
    padding: "8px 12px",
    outline: "none",
    width: "100%",
  }

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
  }

  if (loading) return <p style={{ color: "#666" }}>Loading alerts...</p>

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            style={{ ...selectStyle, width: "auto", minWidth: 160 }}
          >
            <option value="" style={{ background: "#111" }}>All Clients</option>
            {clients.map(c => (
              <option key={c.name} value={c.name} style={{ background: "#111" }}>{c.name}</option>
            ))}
          </select>
          <span style={{ color: "#555", fontSize: 13 }}>{filtered.length} alert{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", background: "linear-gradient(135deg, #2d62ff, #2d40ea)",
            border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          {showCreate ? <X size={14} /> : <Plus size={14} />}
          {showCreate ? "Cancel" : "New Alert"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, padding: 20, marginBottom: 24,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Client</label>
              <select value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} required style={selectStyle}>
                <option value="" style={{ background: "#111" }}>Select client...</option>
                {clients.map(c => <option key={c.name} value={c.name} style={{ background: "#111" }}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Target</label>
              <select value={form.target_role} onChange={e => setForm({ ...form, target_role: e.target.value })} style={selectStyle}>
                {ROLES.map(r => <option key={r.value} value={r.value} style={{ background: "#111" }}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Submit Your Commissions" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Message</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder="Reminder to submit your commission tracker by EOD Friday..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Link URL (optional)</label>
              <input value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." style={inputStyle} />
            </div>
            <div>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Link Label</label>
              <input value={form.link_label} onChange={e => setForm({ ...form, link_label: e.target.value })} placeholder="e.g. Submit Now →" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Frequency</label>
              <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} style={selectStyle}>
                {FREQUENCIES.map(f => <option key={f.value} value={f.value} style={{ background: "#111" }}>{f.label}</option>)}
              </select>
            </div>
            {form.frequency === "weekly" && (
              <div>
                <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Day</label>
                <select value={form.send_day} onChange={e => setForm({ ...form, send_day: e.target.value })} style={selectStyle}>
                  {DAYS.map(d => <option key={d} value={d} style={{ background: "#111" }}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
            )}
            {form.frequency === "monthly" && (
              <div>
                <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Day of Month</label>
                <select value={form.send_month_day} onChange={e => setForm({ ...form, send_month_day: e.target.value })} style={selectStyle}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={String(d)} style={{ background: "#111" }}>{d}{d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}</option>
                  ))}
                  <option value="last" style={{ background: "#111" }}>Last day</option>
                </select>
              </div>
            )}
            <div>
              <label style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block" }}>Time (ET)</label>
              <input type="time" value={form.send_time} onChange={e => setForm({ ...form, send_time: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <button type="submit" style={{
            padding: "10px 24px", background: "#8ceb4c", border: "none", borderRadius: 8,
            color: "#050508", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>
            Create Alert
          </button>
        </form>
      )}

      {/* Alert Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#444" }}>
          <Bell size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
          <p style={{ margin: 0 }}>No alerts configured{filterClient ? ` for ${filterClient}` : ""}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(alert => {
            const isEditing = editingId === alert.id
            const roleColor = ROLE_COLORS[alert.target_role] || "#888"

            return (
              <div key={alert.id} style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${alert.active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                borderRadius: 12, padding: 16, opacity: alert.active ? 1 : 0.5,
                transition: "opacity 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <input
                        value={alert.title}
                        onChange={e => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, title: e.target.value } : a))}
                        style={{ ...inputStyle, marginBottom: 8, fontWeight: 600 }}
                      />
                    ) : (
                      <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#fff" }}>{alert.title}</h3>
                    )}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${roleColor}15`, color: roleColor, fontWeight: 600, textTransform: "capitalize" }}>
                        {alert.target_role === "all" ? "All roles" : `${alert.target_role}s`}
                      </span>
                      <span style={{ fontSize: 11, color: "#666" }}>·</span>
                      <span style={{ fontSize: 11, color: "#888" }}>{alert.client}</span>
                      <span style={{ fontSize: 11, color: "#666" }}>·</span>
                      <span style={{ fontSize: 11, color: "#888", textTransform: "capitalize" }}>
                        {alert.frequency}{alert.send_day ? ` · ${alert.send_day}` : ""}{(alert as any).send_month_day ? ` · day ${(alert as any).send_month_day}` : ""} @ {alert.send_time} ET
                      </span>
                    </div>
                    {isEditing ? (
                      <textarea
                        value={alert.message}
                        onChange={e => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, message: e.target.value } : a))}
                        rows={2}
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                    ) : (
                      <>
                        <p style={{ margin: 0, fontSize: 13, color: "#999", lineHeight: 1.5 }}>{alert.message}</p>
                        {(alert as any).link_url && (
                          <a href={(alert as any).link_url} target="_blank" rel="noopener" style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: "#8ceb4c", textDecoration: "none" }}>
                            {(alert as any).link_label || "Open Link"} →
                          </a>
                        )}
                      </>
                    )}
                    {alert.last_sent_at && (
                      <p style={{ margin: "6px 0 0", fontSize: 11, color: "#555" }}>
                        Last sent: {new Date(alert.last_sent_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(alert)} style={{ background: "rgba(140,235,76,0.1)", border: "1px solid rgba(140,235,76,0.3)", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#8ceb4c" }}>
                          <Save size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#888" }}>
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => toggleActive(alert)} title={alert.active ? "Disable" : "Enable"} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: alert.active ? "#8ceb4c" : "#555" }}>
                          {alert.active ? <Bell size={14} /> : <BellOff size={14} />}
                        </button>
                        <button onClick={() => setEditingId(alert.id)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#888" }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(alert.id)} style={{ background: "rgba(255,93,0,0.08)", border: "1px solid rgba(255,93,0,0.2)", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#ff5d00" }}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
