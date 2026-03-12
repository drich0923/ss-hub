"use client"

import { useState, useEffect, useCallback } from "react"
import { ExternalLink, Mail, BarChart2, ClipboardList, BookOpen, MessageSquare, TrendingUp, Phone, Calendar, DollarSign, Shield, Pencil, Plus, Trash2, X, Check, AlertTriangle, RefreshCw } from "lucide-react"

/* ───────── Types ───────── */

type QuickLinkData = { label: string; desc: string; color: string; url: string }
type TeamMemberData = { name: string; title: string; dept: string; email?: string; bestFor?: string; initials: string; color: string; photo?: string }
type SupportChannelData = { tag: string; desc: string }

/* ───────── Default Data ───────── */

const TEAM: TeamMemberData[] = [
  { name: "Dylan Rich", title: "Co-Founder", dept: "Leadership", email: "dylan@systemizedsales.com", initials: "DR", color: "#2d62ff", photo: "/headshots/dylan_rich.jpg", bestFor: "Big picture strategy & partnerships" },
  { name: "Jake Tacher", title: "Co-Founder", dept: "Leadership", email: "jake@systemizedsales.com", initials: "JT", color: "#2d62ff", photo: "/headshots/jake_tacher.jpg", bestFor: "High-level sales decisions" },
  { name: "Cory", title: "Director of Operations", dept: "Leadership", email: "cory@systemizedsales.com", initials: "CO", color: "#8ceb4c", photo: "/headshots/cory.jpg", bestFor: "Operations, processes & escalations" },
  { name: "Nate Price", title: "VP of Sales", dept: "Leadership", email: "nate@systemizedsales.com", initials: "NP", color: "#8ceb4c", photo: "/headshots/nate_price.jpg", bestFor: "Sales performance & rep coaching" },
  { name: "Tristan Steckler", title: "Sales Manager", dept: "Sales", email: "tristan@systemizedsales.com", initials: "TS", color: "#a78bfa", photo: "/headshots/tristan_steckler.jpg", bestFor: "Day-to-day sales team management" },
  { name: "Mauricio Garrido", title: "Setter Manager", dept: "Sales", email: "mauricio@systemizedsales.com", initials: "MG", color: "#a78bfa", photo: "/headshots/mauricio_garrido.jpg", bestFor: "Setter performance & lead flow" },
  { name: "Kyla Mendoza", title: "Operations Manager", dept: "Operations", email: "kyla@systemizedsales.com", initials: "KM", color: "#ff5d00", photo: "/headshots/kyla_mendoza.jpg", bestFor: "Onboarding, workflows & systems" },
  { name: "Cian", title: "Automations, Data & Tracking", dept: "Operations", email: "cian@systemizedsales.com", initials: "CI", color: "#ff5d00", photo: "/headshots/cian.jpg", bestFor: "Automations, integrations & reporting" },
  { name: "David", title: "Automations, Data & Tracking", dept: "Operations", initials: "DV", color: "#ff5d00", photo: "/headshots/david.jpg", bestFor: "Data pipelines & tracking setup" },
  { name: "Kat", title: "Support Ticket Coordinator", dept: "Customer Support", email: "kat@systemizedsales.com", initials: "KT", color: "#f59e0b", photo: "/headshots/kat.jpg", bestFor: "Support tickets & issue resolution" },
  { name: "Hannah", title: "Support Ticket Coordinator", dept: "Customer Support", initials: "HA", color: "#f59e0b", photo: "/headshots/hannah.jpg", bestFor: "Support tickets & issue resolution" },
]

const DEPT_ORDER = ["Leadership", "Sales", "Operations", "Customer Support"]

const DEPT_COLORS: Record<string, string> = {
  Leadership: "#2d62ff",
  Sales: "#a78bfa",
  Operations: "#ff5d00",
  "Customer Support": "#f59e0b",
}

const DEFAULT_QUICK_LINKS: QuickLinkData[] = [
  { label: "Sales Tracker", desc: "View pipeline, revenue, and rep performance metrics", color: "#2d62ff", url: "#" },
  { label: "Scorecard", desc: "Rep scorecards, KPIs, and performance benchmarks", color: "#8ceb4c", url: "#" },
  { label: "Cash Collected", desc: "Track revenue collected across all reps and deals", color: "#a78bfa", url: "#" },
  { label: "Post Call Notes", desc: "Submit and review PCN entries for every appointment", color: "#f59e0b", url: "#" },
]

const CLIENT_CONFIGS: Record<string, { quickLinks: QuickLinkData[]; ghlLocationId?: string }> = {
  Budgetdog: {
    ghlLocationId: "IKw1E7VUZwSDe8WFAxIM",
    quickLinks: [
      { label: "Sales Tracker", desc: "View pipeline, revenue, and rep performance metrics", color: "#2d62ff", url: "https://docs.google.com/spreadsheets/d/1LwP5gYv93JQPaw65f_kNxjnOF_TyUXB0_AUTQEWkkMk/edit?gid=457479693#gid=457479693" },
      { label: "Scorecard", desc: "Rep scorecards, KPIs, and performance benchmarks", color: "#8ceb4c", url: "https://docs.google.com/spreadsheets/d/1SqW1lshDXpx20Ayxx1TE5TtvQ168JtxRrf_ROjX9EBs/edit?gid=3306932#gid=3306932" },
      { label: "Cash Collected", desc: "Track revenue collected across all reps and deals", color: "#a78bfa", url: "https://docs.google.com/spreadsheets/d/1XmYFfVRm-uySClXGn6NzN5F5rJBBL-LwzZTkYbTssMk/edit?gid=932012897#gid=932012897" },
      { label: "Post Call Notes", desc: "Submit and review PCN entries for every appointment", color: "#f59e0b", url: "https://www.notion.so/22c4930ab85f80b68a9ed7af9f3964f4" },
    ],
  },
}

const DEFAULT_SUPPORT_CHANNELS: SupportChannelData[] = [
  { tag: "#support", desc: "General questions and requests" },
  { tag: "#post-call-notes", desc: "PCN submissions and reminders" },
  { tag: "#pcn-submissions", desc: "Completed PCN data" },
  { tag: "#custom-payment-links", desc: "Payment link generation" },
]

const ICON_MAP: Record<string, typeof BarChart2> = { BarChart2, ClipboardList, BookOpen, DollarSign, MessageSquare, TrendingUp, Phone, Calendar }

function getIconForLink(label: string) {
  if (label.toLowerCase().includes("tracker")) return BarChart2
  if (label.toLowerCase().includes("scorecard")) return ClipboardList
  if (label.toLowerCase().includes("cash") || label.toLowerCase().includes("revenue")) return DollarSign
  if (label.toLowerCase().includes("note") || label.toLowerCase().includes("call")) return BookOpen
  return BarChart2
}

// Internal (admin-only) widget slugs
const INTERNAL_WIDGETS = [
  { slug: "hiring-dashboard", label: "Hiring Dashboard", desc: "Review and manage sales rep applicants", icon: "\u{1F465}", color: "#2d62ff", url: "https://hiring.systemizedsales.com" },
  { slug: "qc-dashboard", label: "QC Dashboard", desc: "Rep performance, SOP compliance, and pipeline hygiene", icon: "\u{1F4CB}", color: "#8ceb4c", url: "/qc-dashboard" },
]

const CLIENT_WIDGETS = [
  { slug: "playbook", label: "Sales Rep Playbook", desc: "Scripts, objections, and training resources", icon: "\u{1F4D6}", color: "#ff5d00", url: "#" },
  { slug: "rep-onboarding", label: "Sales Rep Onboarding", desc: "Onboarding portal for new sales reps", icon: "\u{1F680}", color: "#a78bfa", url: "#" },
  { slug: "command-center", label: "Client Command Center", desc: "Your sales team metrics and performance at a glance", icon: "\u{1F4CA}", color: "#2d62ff", url: "/command-center" },
]

const KPI_PLACEHOLDERS = [
  { label: "Calls Booked", value: "\u2014", sub: "This week", icon: Calendar, color: "#2d62ff" },
  { label: "Show Rate", value: "\u2014", sub: "Last 30 days", icon: Phone, color: "#8ceb4c" },
  { label: "Cash Collected", value: "\u2014", sub: "This month", icon: DollarSign, color: "#a78bfa" },
  { label: "Pipeline Value", value: "\u2014", sub: "Active deals", icon: TrendingUp, color: "#ff5d00" },
]

/* ───────── Shared Styles ───────── */

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  borderRadius: "8px",
  padding: "8px 12px",
  width: "100%",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box" as const,
}

const modalStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  padding: "16px",
  position: "absolute" as const,
  zIndex: 100,
  top: "100%",
  left: 0,
  right: 0,
  marginTop: "4px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
}

/* ───────── Edit Components ───────── */

function EditOverlay({ children, onEdit, onDelete, show }: { children: React.ReactNode; onEdit: () => void; onDelete?: () => void; show: boolean }) {
  return (
    <div style={{ position: "relative" }}>
      {children}
      {show && (
        <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "4px", zIndex: 50 }}>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit() }} style={{ background: "rgba(45,98,255,0.2)", border: "1px solid rgba(45,98,255,0.3)", borderRadius: "6px", padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Pencil size={12} color="#2d62ff" />
          </button>
          {onDelete && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete() }} style={{ background: "rgba(255,59,48,0.2)", border: "1px solid rgba(255,59,48,0.3)", borderRadius: "6px", padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Trash2 size={12} color="#ff3b30" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function QuickLinkEditor({ link, onSave, onCancel }: { link: QuickLinkData; onSave: (l: QuickLinkData) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(link)
  return (
    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input style={inputStyle} value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="Label" />
        <input style={inputStyle} value={draft.url} onChange={e => setDraft({ ...draft, url: e.target.value })} placeholder="URL" />
        <input style={inputStyle} value={draft.desc} onChange={e => setDraft({ ...draft, desc: e.target.value })} placeholder="Description" />
        <input style={inputStyle} value={draft.color} onChange={e => setDraft({ ...draft, color: e.target.value })} placeholder="Color (#hex)" />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
          <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 12px", color: "#888", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(draft)} style={{ background: "rgba(45,98,255,0.2)", border: "1px solid rgba(45,98,255,0.3)", borderRadius: "6px", padding: "6px 12px", color: "#2d62ff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Apply</button>
        </div>
      </div>
    </div>
  )
}

function TeamMemberEditor({ member, onSave, onCancel }: { member: TeamMemberData; onSave: (m: TeamMemberData) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(member)
  return (
    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input style={inputStyle} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Name" />
        <input style={inputStyle} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Title" />
        <input style={inputStyle} value={draft.email || ""} onChange={e => setDraft({ ...draft, email: e.target.value })} placeholder="Email" />
        <input style={inputStyle} value={draft.bestFor || ""} onChange={e => setDraft({ ...draft, bestFor: e.target.value })} placeholder="Best for..." />
        <select style={{ ...inputStyle, appearance: "auto" as const }} value={draft.dept} onChange={e => setDraft({ ...draft, dept: e.target.value, color: DEPT_COLORS[e.target.value] || draft.color })}>
          {DEPT_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
          <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 12px", color: "#888", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(draft)} style={{ background: "rgba(45,98,255,0.2)", border: "1px solid rgba(45,98,255,0.3)", borderRadius: "6px", padding: "6px 12px", color: "#2d62ff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Apply</button>
        </div>
      </div>
    </div>
  )
}

function SupportChannelEditor({ channel, onSave, onCancel }: { channel: SupportChannelData; onSave: (c: SupportChannelData) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(channel)
  return (
    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input style={inputStyle} value={draft.tag} onChange={e => setDraft({ ...draft, tag: e.target.value })} placeholder="#channel-name" />
        <input style={inputStyle} value={draft.desc} onChange={e => setDraft({ ...draft, desc: e.target.value })} placeholder="Description" />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
          <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 12px", color: "#888", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(draft)} style={{ background: "rgba(45,98,255,0.2)", border: "1px solid rgba(45,98,255,0.3)", borderRadius: "6px", padding: "6px 12px", color: "#2d62ff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Apply</button>
        </div>
      </div>
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "2px dashed rgba(255,255,255,0.1)",
        borderRadius: "14px",
        padding: "20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        color: "#555",
        fontSize: "13px",
        fontWeight: 500,
        transition: "all 0.15s",
        minHeight: "80px",
      }}
    >
      <Plus size={16} /> {label}
    </button>
  )
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: 9999,
      background: type === "success" ? "rgba(140,235,76,0.15)" : "rgba(255,59,48,0.15)",
      border: `1px solid ${type === "success" ? "rgba(140,235,76,0.3)" : "rgba(255,59,48,0.3)"}`,
      borderRadius: "10px",
      padding: "12px 20px",
      color: type === "success" ? "#8ceb4c" : "#ff3b30",
      fontSize: "13px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>
      {type === "success" ? <Check size={14} /> : <X size={14} />}
      {message}
    </div>
  )
}

/* ───────── GHL Live Feed ───────── */

type GHLStats = { open_opps: number; open_value: number; overdue_tasks: number; upcoming_appts: number }
type GHLOpp = { id: string; contact_name: string; contact_url: string; stage_name: string; assigned_to: string; monetary_value: number; updated_at: string }
type GHLTask = { id: string; title: string; contact_name: string; contact_url: string; assigned_to: string; due_date: string; completed: boolean }
type GHLAppt = { id: string; title: string; contact_name: string; contact_url: string; start_time: string; calendar_name: string; status: string }
type GHLData = { opportunities: GHLOpp[]; tasks: GHLTask[]; appointments: GHLAppt[]; stats: GHLStats }

function GHLLiveFeed({ locationId }: { locationId: string }) {
  const [data, setData] = useState<GHLData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"opportunities" | "tasks" | "appointments">("opportunities")

  const fetchData = useCallback(() => {
    fetch(`/api/ghl-data?location_id=${encodeURIComponent(locationId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locationId])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  const fmtCurrency = (v: number) => "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 })
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const fmtDateTime = (d: string) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  const isOverdue = (d: string) => new Date(d) < new Date()

  if (loading) {
    return (
      <div style={{ marginBottom: "52px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>{"\u{1F4E1}"} GHL Live Feed</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px", height: "80px" }}>
              <div style={{ width: "60%", height: "14px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "8px" }} />
              <div style={{ width: "40%", height: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const stats = data.stats
  const statCards = [
    { label: "Open Deals", value: String(stats.open_opps), icon: TrendingUp, color: "#2d62ff" },
    { label: "Pipeline Value", value: fmtCurrency(stats.open_value), icon: DollarSign, color: "#8ceb4c" },
    { label: "Overdue Tasks", value: String(stats.overdue_tasks), icon: AlertTriangle, color: stats.overdue_tasks > 0 ? "#ff3b30" : "#666" },
    { label: "Upcoming Appts", value: String(stats.upcoming_appts), icon: Calendar, color: "#a78bfa" },
  ]

  const tabs = [
    { key: "opportunities" as const, label: "Opportunities" },
    { key: "tasks" as const, label: "Tasks" },
    { key: "appointments" as const, label: "Appointments" },
  ]

  const contactLink = (name: string, url: string) =>
    url ? <a href={url} target="_blank" rel="noreferrer" style={{ color: "#2d62ff", textDecoration: "none", fontSize: "13px" }}>{name || "—"}</a>
      : <span style={{ color: "#fff", fontSize: "13px" }}>{name || "—"}</span>

  return (
    <div style={{ marginBottom: "52px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444" }}>{"\u{1F4E1}"} GHL Live Feed</div>
        <button onClick={() => { setLoading(true); fetchData() }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
          <RefreshCw size={12} color="#444" />
          <span style={{ fontSize: "10px", color: "#444" }}>Refresh</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color === "#ff3b30" && stats.overdue_tasks > 0 ? "rgba(255,59,48,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: s.color === "#ff3b30" && stats.overdue_tasks > 0 ? "#ff3b30" : "#fff", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#888", fontWeight: 500, marginTop: "4px" }}>{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "4px", border: "1px solid rgba(255,255,255,0.07)" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600,
            background: tab === t.key ? "rgba(140,235,76,0.12)" : "transparent",
            color: tab === t.key ? "#8ceb4c" : "#555",
            transition: "all 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
        {tab === "opportunities" && (
          data.opportunities.length === 0
            ? <div style={{ padding: "32px", textAlign: "center", color: "#444", fontSize: "13px" }}>No open opportunities</div>
            : <div>
                {data.opportunities.map((opp, i) => (
                  <div key={opp.id} style={{ padding: "14px 18px", borderBottom: i < data.opportunities.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 140px", minWidth: 0 }}>{contactLink(opp.contact_name, opp.contact_url)}</div>
                    <div style={{ flex: "0 0 120px", fontSize: "12px", color: "#666" }}>{opp.stage_name || "—"}</div>
                    <div style={{ flex: "0 0 100px", fontSize: "12px", color: "#555" }}>{opp.assigned_to || "—"}</div>
                    <div style={{ flex: "0 0 90px", fontSize: "13px", fontWeight: 600, color: "#8ceb4c", textAlign: "right" }}>{opp.monetary_value ? fmtCurrency(opp.monetary_value) : "—"}</div>
                    <div style={{ flex: "0 0 80px", fontSize: "11px", color: "#444", textAlign: "right" }}>{opp.updated_at ? fmtDate(opp.updated_at) : "—"}</div>
                  </div>
                ))}
              </div>
        )}

        {tab === "tasks" && (
          data.tasks.length === 0
            ? <div style={{ padding: "32px", textAlign: "center", color: "#444", fontSize: "13px" }}>No open tasks</div>
            : <div>
                {data.tasks.map((task, i) => (
                  <div key={task.id} style={{ padding: "14px 18px", borderBottom: i < data.tasks.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 180px", fontSize: "13px", color: "#fff", minWidth: 0 }}>{task.title || "—"}</div>
                    <div style={{ flex: "0 0 130px", minWidth: 0 }}>{contactLink(task.contact_name, task.contact_url)}</div>
                    <div style={{ flex: "0 0 100px", fontSize: "12px", color: "#555" }}>{task.assigned_to || "—"}</div>
                    <div style={{ flex: "0 0 90px", fontSize: "12px", fontWeight: 600, color: task.due_date && isOverdue(task.due_date) ? "#ff3b30" : "#666", textAlign: "right" }}>
                      {task.due_date ? fmtDate(task.due_date) : "—"}
                    </div>
                  </div>
                ))}
              </div>
        )}

        {tab === "appointments" && (
          data.appointments.length === 0
            ? <div style={{ padding: "32px", textAlign: "center", color: "#444", fontSize: "13px" }}>No upcoming appointments</div>
            : <div>
                {data.appointments.map((appt, i) => (
                  <div key={appt.id} style={{ padding: "14px 18px", borderBottom: i < data.appointments.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 180px", fontSize: "13px", color: "#fff", minWidth: 0 }}>{appt.title || "—"}</div>
                    <div style={{ flex: "0 0 130px", minWidth: 0 }}>{contactLink(appt.contact_name, appt.contact_url)}</div>
                    <div style={{ flex: "0 0 130px", fontSize: "12px", color: "#666" }}>{appt.start_time ? fmtDateTime(appt.start_time) : "—"}</div>
                    <div style={{ flex: "0 0 100px", fontSize: "12px", color: "#555" }}>{appt.calendar_name || "—"}</div>
                    <div style={{ flex: "0 0 70px", fontSize: "11px", color: appt.status === "confirmed" ? "#8ceb4c" : "#f59e0b", textAlign: "right", fontWeight: 600 }}>{appt.status || "—"}</div>
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  )
}

/* ───────── Main Component ───────── */

export default function CommandCenterClient({ clientName, clientSlug, userEmail, role, isAdmin }: { clientName: string; clientSlug?: string; userEmail: string; role: string; isAdmin: boolean }) {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)
  const [hoveredQuickLink, setHoveredQuickLink] = useState<string | null>(null)
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null)

  // Edit mode state
  const [editMode, setEditMode] = useState(false)
  const [editingQuickLink, setEditingQuickLink] = useState<number | null>(null)
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [editingChannel, setEditingChannel] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Editable data
  const [quickLinks, setQuickLinks] = useState<QuickLinkData[]>(CLIENT_CONFIGS[clientName]?.quickLinks ?? DEFAULT_QUICK_LINKS)
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>(TEAM)
  const [supportChannels, setSupportChannels] = useState<SupportChannelData[]>(DEFAULT_SUPPORT_CHANNELS)

  // Snapshot for cancel
  const [snapshot, setSnapshot] = useState<{ quickLinks: QuickLinkData[]; teamMembers: TeamMemberData[]; supportChannels: SupportChannelData[] } | null>(null)

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Load saved config on mount
  useEffect(() => {
    fetch(`/api/command-center-config?client=${encodeURIComponent(clientName)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.quick_links) setQuickLinks(data.quick_links)
          if (data.team_members) setTeamMembers(data.team_members)
          if (data.support_channels) setSupportChannels(data.support_channels)
        }
      })
      .catch(() => {})
  }, [clientName])

  const enterEditMode = () => {
    setSnapshot({ quickLinks: JSON.parse(JSON.stringify(quickLinks)), teamMembers: JSON.parse(JSON.stringify(teamMembers)), supportChannels: JSON.parse(JSON.stringify(supportChannels)) })
    setEditMode(true)
  }

  const cancelEdit = () => {
    if (snapshot) {
      setQuickLinks(snapshot.quickLinks)
      setTeamMembers(snapshot.teamMembers)
      setSupportChannels(snapshot.supportChannels)
    }
    setEditMode(false)
    setEditingQuickLink(null)
    setEditingMember(null)
    setEditingChannel(null)
    setSnapshot(null)
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/command-center-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: clientName,
          quick_links: quickLinks,
          team_members: teamMembers,
          support_channels: supportChannels,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      showToast("Saved \u2705", "success")
      setEditMode(false)
      setEditingQuickLink(null)
      setEditingMember(null)
      setEditingChannel(null)
      setSnapshot(null)
    } catch {
      showToast("Failed to save", "error")
    } finally {
      setSaving(false)
    }
  }

  const deptGroups = DEPT_ORDER.map(dept => ({ dept, members: teamMembers.filter(m => m.dept === dept) }))

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/" style={{ color: "#555", fontSize: "12px", textDecoration: "none" }}>&larr; Hub</a>
          <div style={{ width: "1px", height: "14px", background: "#222" }} />
          <span style={{ fontSize: "12px", color: "#444" }}>Command Center</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isAdmin && !editMode && (
            <button
              onClick={enterEditMode}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(45,98,255,0.08)", border: "1px solid rgba(45,98,255,0.2)",
                borderRadius: "6px", padding: "5px 10px", cursor: "pointer", color: "#2d62ff", fontSize: "11px", fontWeight: 600,
              }}
            >
              <Pencil size={11} /> Edit Page
            </button>
          )}
          {isAdmin && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(140,235,76,0.08)", border: "1px solid rgba(140,235,76,0.2)", borderRadius: "6px", padding: "3px 8px" }}>
              <Shield size={10} color="#8ceb4c" />
              <span style={{ fontSize: "11px", color: "#8ceb4c", fontWeight: 600 }}>Admin</span>
            </div>
          )}
          <div style={{ fontSize: "12px", color: "#444" }}>{userEmail}</div>
        </div>
      </div>

      {/* Edit Mode Floating Bar */}
      {editMode && (
        <div style={{
          position: "fixed", top: "16px", right: "16px", zIndex: 9000,
          background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
          padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>Editing</span>
          </div>
          <button
            onClick={cancelEdit}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 12px", color: "#888", fontSize: "12px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={saveAll}
            disabled={saving}
            style={{
              background: "rgba(140,235,76,0.15)", border: "1px solid rgba(140,235,76,0.3)",
              borderRadius: "6px", padding: "6px 14px", color: "#8ceb4c", fontSize: "12px", fontWeight: 600,
              cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      )}

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "64px 32px 56px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(45,98,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(140,235,76,0.08)", border: "1px solid rgba(140,235,76,0.2)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8ceb4c" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#8ceb4c", letterSpacing: "0.5px" }}>{clientName}</span>
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            {clientName} Command Center
          </h1>
          <p style={{ fontSize: "16px", color: "#666", margin: "0 0 8px" }}>
            Your team is here to help you win.
          </p>
          <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
            Everything you need &mdash; your team, tools, and resources in one place.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>

        {/* Internal Widgets (admin only) */}
        {isAdmin && (
          <div style={{ marginBottom: "52px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>{"\u{1F512}"} Internal Tools</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
              {INTERNAL_WIDGETS.map(widget => {
                const isLive = widget.url !== "#"
                return (
                  <a key={widget.slug} href={isLive ? widget.url : undefined} target={isLive && widget.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${isLive ? `${widget.color}30` : "rgba(255,255,255,0.07)"}`, borderRadius: "14px", padding: "20px", textDecoration: "none", display: "block", cursor: isLive ? "pointer" : "default", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div style={{ fontSize: "24px" }}>{widget.icon}</div>
                      {isLive ? <ExternalLink size={13} color="#555" /> : <span style={{ fontSize: "10px", color: "#444", background: "rgba(255,255,255,0.06)", borderRadius: "4px", padding: "2px 6px", fontWeight: 600, letterSpacing: "0.5px" }}>SOON</span>}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>{widget.label}</div>
                    <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }}>{widget.desc}</div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Client-Facing Widgets */}
        <div style={{ marginBottom: "52px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>{"\u{1F9E9}"} Client Tools</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            {CLIENT_WIDGETS.map(widget => {
              const isLive = widget.url !== "#"
              return (
                <a key={widget.slug} href={isLive ? widget.url : undefined} target={isLive && widget.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${isLive ? `${widget.color}30` : "rgba(255,255,255,0.07)"}`, borderRadius: "14px", padding: "20px", textDecoration: "none", display: "block", cursor: isLive ? "pointer" : "default", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ fontSize: "24px" }}>{widget.icon}</div>
                    {isLive ? <ExternalLink size={13} color="#555" /> : <span style={{ fontSize: "10px", color: "#444", background: "rgba(255,255,255,0.06)", borderRadius: "4px", padding: "2px 6px", fontWeight: 600, letterSpacing: "0.5px" }}>SOON</span>}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>{widget.label}</div>
                  <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }}>{widget.desc}</div>
                </a>
              )
            })}
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ marginBottom: "52px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>{"\u{1F4CA}"} Performance Snapshot</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {KPI_PLACEHOLDERS.map(kpi => {
              const Icon = kpi.icon
              return (
                <div key={kpi.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={kpi.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{kpi.value}</div>
                    <div style={{ fontSize: "12px", color: "#fff", fontWeight: 500, marginTop: "4px" }}>{kpi.label}</div>
                    <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>{kpi.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: "11px", color: "#333", margin: "10px 0 0" }}>GHL integration coming soon &mdash; live metrics will populate automatically.</p>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: "52px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>{"\u{1F680}"} Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            {quickLinks.map((link, idx) => {
              const Icon = getIconForLink(link.label)
              const isLive = link.url !== "#"
              const isHovered = hoveredQuickLink === `${idx}`
              const isEditing = editingQuickLink === idx
              return (
                <div key={idx} style={{ position: "relative" }} onMouseEnter={() => setHoveredQuickLink(`${idx}`)} onMouseLeave={() => setHoveredQuickLink(null)}>
                  <EditOverlay show={editMode && isHovered && !isEditing} onEdit={() => setEditingQuickLink(idx)} onDelete={() => setQuickLinks(ql => ql.filter((_, i) => i !== idx))}>
                    <a
                      href={!editMode && isLive ? link.url : undefined}
                      target={!editMode && isLive ? "_blank" : undefined}
                      rel="noreferrer"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${isLive ? `${link.color}30` : "rgba(255,255,255,0.07)"}`,
                        borderRadius: "14px", padding: "20px", textDecoration: "none", display: "block",
                        cursor: editMode ? "default" : isLive ? "pointer" : "default", transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: `${link.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={20} color={link.color} />
                        </div>
                        {isLive ? <ExternalLink size={13} color="#555" /> : <span style={{ fontSize: "10px", color: "#444", background: "rgba(255,255,255,0.06)", borderRadius: "4px", padding: "2px 6px", fontWeight: 600, letterSpacing: "0.5px" }}>SOON</span>}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>{link.label}</div>
                      <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }}>{link.desc}</div>
                    </a>
                  </EditOverlay>
                  {isEditing && (
                    <QuickLinkEditor
                      link={link}
                      onSave={(updated) => { setQuickLinks(ql => ql.map((l, i) => i === idx ? updated : l)); setEditingQuickLink(null) }}
                      onCancel={() => setEditingQuickLink(null)}
                    />
                  )}
                </div>
              )
            })}
            {editMode && (
              <AddButton label="Add Quick Link" onClick={() => {
                setQuickLinks(ql => [...ql, { label: "New Link", desc: "Description", color: "#2d62ff", url: "#" }])
                setEditingQuickLink(quickLinks.length)
              }} />
            )}
          </div>
        </div>

        {/* Support Team */}
        <div style={{ marginBottom: "52px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "20px" }}>{"\u{1F465}"} Your Support Team</div>
          {deptGroups.filter(g => g.members.length > 0).map(group => (
            <div key={group.dept} style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: DEPT_COLORS[group.dept] }} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", letterSpacing: "1px", textTransform: "uppercase" as const }}>{group.dept}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "10px" }}>
                {group.members.map(member => {
                  const isHovered = hoveredMember === member.name
                  const isEditing = editingMember === member.name
                  return (
                    <div key={member.name} style={{ position: "relative" }}>
                      <EditOverlay
                        show={editMode && isHovered && !isEditing}
                        onEdit={() => setEditingMember(member.name)}
                        onDelete={() => setTeamMembers(tm => tm.filter(m => m.name !== member.name))}
                      >
                        <div
                          onMouseEnter={() => { setHoveredMember(member.name) }}
                          onMouseLeave={() => { setHoveredMember(null) }}
                          style={{
                            background: isHovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isHovered ? `${member.color}30` : "rgba(255,255,255,0.07)"}`,
                            borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px",
                            transition: "all 0.15s", cursor: "default", position: "relative" as const,
                          }}
                        >
                          <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: `${member.color}20`, border: `2px solid ${member.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: member.color }}>
                            {member.photo ? (
                              <img src={member.photo} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                            ) : (
                              member.initials
                            )}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{member.name}</div>
                            <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{member.title}</div>
                            {isHovered && member.bestFor && (
                              <div style={{ fontSize: "11px", color: member.color, marginTop: "6px", lineHeight: 1.4, fontWeight: 500 }}>
                                Best for: {member.bestFor}
                              </div>
                            )}
                            {!isHovered && member.email && (
                              <a href={`mailto:${member.email}`} style={{ fontSize: "11px", color: "#2d62ff", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                                <Mail size={10} /> {member.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </EditOverlay>
                      {isEditing && (
                        <TeamMemberEditor
                          member={member}
                          onSave={(updated) => {
                            setTeamMembers(tm => tm.map(m => m.name === member.name ? { ...updated, initials: updated.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) } : m))
                            setEditingMember(null)
                          }}
                          onCancel={() => setEditingMember(null)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {editMode && (
            <AddButton label="Add Team Member" onClick={() => {
              const newMember: TeamMemberData = { name: "New Member", title: "Title", dept: "Operations", email: "", initials: "NM", color: DEPT_COLORS["Operations"], bestFor: "" }
              setTeamMembers(tm => [...tm, newMember])
              setEditingMember("New Member")
            }} />
          )}
        </div>

        {/* Support Channels */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>{"\u{1F4AC}"} Support Channels</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
            {supportChannels.map((ch, idx) => {
              const isHovered = hoveredChannel === `${idx}`
              const isEditing = editingChannel === idx
              return (
                <div key={idx} style={{ position: "relative" }} onMouseEnter={() => setHoveredChannel(`${idx}`)} onMouseLeave={() => setHoveredChannel(null)}>
                  <EditOverlay show={editMode && isHovered && !isEditing} onEdit={() => setEditingChannel(idx)} onDelete={() => setSupportChannels(sc => sc.filter((_, i) => i !== idx))}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ background: "rgba(45,98,255,0.12)", border: "1px solid rgba(45,98,255,0.2)", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, color: "#2d62ff", whiteSpace: "nowrap" as const, flexShrink: 0 }}>{ch.tag}</div>
                      <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.5, paddingTop: "2px" }}>{ch.desc}</div>
                    </div>
                  </EditOverlay>
                  {isEditing && (
                    <SupportChannelEditor
                      channel={ch}
                      onSave={(updated) => { setSupportChannels(sc => sc.map((c, i) => i === idx ? updated : c)); setEditingChannel(null) }}
                      onCancel={() => setEditingChannel(null)}
                    />
                  )}
                </div>
              )
            })}
            {editMode && (
              <AddButton label="Add Channel" onClick={() => {
                setSupportChannels(sc => [...sc, { tag: "#new-channel", desc: "Description" }])
                setEditingChannel(supportChannels.length)
              }} />
            )}
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
