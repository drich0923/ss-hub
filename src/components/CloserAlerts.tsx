"use client"

import { useState, useEffect } from "react"
import { Bell, Check, AlertTriangle, X } from "lucide-react"

interface Alert {
  id: string
  title: string
  message: string
  target_role: string
  frequency: string
  is_read: boolean
  created_at: string
}

export default function CloserAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/closer/alerts")
      .then(r => r.json())
      .then(data => { setAlerts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const unreadCount = alerts.filter(a => !a.is_read).length

  async function markRead(alertId: string) {
    await fetch("/api/closer/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId }),
    })
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a))
  }

  async function markAllRead() {
    for (const a of alerts.filter(x => !x.is_read)) {
      await markRead(a.id)
    }
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: open ? "rgba(140,235,76,0.12)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${open ? "rgba(140,235,76,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 8,
          padding: "6px 8px",
          cursor: "pointer",
          color: open ? "#8ceb4c" : "#aaa",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "#ff5d00",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            width: 18,
            height: 18,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #050508",
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 360,
          maxHeight: 480,
          overflowY: "auto",
          background: "#111",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          zIndex: 100,
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
              Action Items {unreadCount > 0 && `(${unreadCount})`}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ background: "none", border: "none", color: "#8ceb4c", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Alerts list */}
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "#555" }}>Loading...</div>
          ) : alerts.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#444" }}>
              <Check size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: 13 }}>All caught up!</p>
            </div>
          ) : (
            <div>
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => !alert.is_read && markRead(alert.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: alert.is_read ? "default" : "pointer",
                    background: alert.is_read ? "transparent" : "rgba(255,93,0,0.04)",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      marginTop: 2,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: alert.is_read ? "rgba(255,255,255,0.1)" : "#ff5d00",
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: "0 0 4px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: alert.is_read ? "#888" : "#fff",
                      }}>
                        {alert.title}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: 12,
                        color: alert.is_read ? "#555" : "#999",
                        lineHeight: 1.4,
                      }}>
                        {alert.message.length > 120 ? alert.message.slice(0, 120) + "..." : alert.message}
                      </p>
                      <span style={{ fontSize: 10, color: "#444", marginTop: 4, display: "block" }}>
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
