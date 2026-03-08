"use client"

import { useState } from "react"
import { ExternalLink, Mail, BarChart2, ClipboardList, BookOpen, MessageSquare, TrendingUp, Phone, Calendar, DollarSign } from "lucide-react"

const TEAM = [
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

const QUICK_LINKS = [
  {
    label: "Sales Tracker",
    desc: "View pipeline, revenue, and rep performance metrics",
    icon: BarChart2,
    color: "#2d62ff",
    url: "https://docs.google.com/spreadsheets/d/1LwP5gYv93JQPaw65f_kNxjnOF_TyUXB0_AUTQEWkkMk/edit?gid=457479693#gid=457479693",
  },
  {
    label: "Scorecard",
    desc: "Rep scorecards, KPIs, and performance benchmarks",
    icon: ClipboardList,
    color: "#8ceb4c",
    url: "https://docs.google.com/spreadsheets/d/1SqW1lshDXpx20Ayxx1TE5TtvQ168JtxRrf_ROjX9EBs/edit?gid=3306932#gid=3306932",
  },
  {
    label: "Cash Collected",
    desc: "Track revenue collected across all reps and deals",
    icon: DollarSign,
    color: "#a78bfa",
    url: "https://docs.google.com/spreadsheets/d/1XmYFfVRm-uySClXGn6NzN5F5rJBBL-LwzZTkYbTssMk/edit?gid=932012897#gid=932012897",
  },
  {
    label: "Post Call Notes",
    desc: "Submit and review PCN entries for every appointment",
    icon: BookOpen,
    color: "#f59e0b",
    url: "https://www.notion.so/22c4930ab85f80b68a9ed7af9f3964f4",
  },
]

const KPI_PLACEHOLDERS = [
  { label: "Calls Booked", value: "—", sub: "This week", icon: Calendar, color: "#2d62ff" },
  { label: "Show Rate", value: "—", sub: "Last 30 days", icon: Phone, color: "#8ceb4c" },
  { label: "Cash Collected", value: "—", sub: "This month", icon: DollarSign, color: "#a78bfa" },
  { label: "Pipeline Value", value: "—", sub: "Active deals", icon: TrendingUp, color: "#ff5d00" },
]

const SUPPORT_CHANNELS = [
  { tag: "#support", desc: "General questions and requests" },
  { tag: "#post-call-notes", desc: "PCN submissions and reminders" },
  { tag: "#pcn-submissions", desc: "Completed PCN data" },
  { tag: "#custom-payment-links", desc: "Payment link generation" },
]

export default function CommandCenterClient({ clientName, clientSlug, userEmail }: { clientName: string; clientSlug?: string; userEmail: string }) {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)
  const deptGroups = DEPT_ORDER.map(dept => ({ dept, members: TEAM.filter(m => m.dept === dept) }))

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/" style={{ color: "#555", fontSize: "12px", textDecoration: "none" }}>← Hub</a>
          <div style={{ width: "1px", height: "14px", background: "#222" }} />
          <span style={{ fontSize: "12px", color: "#444" }}>Command Center</span>
        </div>
        <div style={{ fontSize: "12px", color: "#444" }}>{userEmail}</div>
      </div>

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "64px 32px 56px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(45,98,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          {/* Client badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(140,235,76,0.08)", border: "1px solid rgba(140,235,76,0.2)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8ceb4c" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#8ceb4c", letterSpacing: "0.5px" }}>{clientName}</span>
          </div>

          <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            CEO Command Center
          </h1>
          <p style={{ fontSize: "16px", color: "#666", margin: "0 0 8px" }}>
            Your team is here to help you win.
          </p>
          <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
            Everything you need — your team, tools, and resources in one place.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px" }}>

        {/* KPI Row */}
        <div style={{ marginBottom: "52px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>📊 Performance Snapshot</div>
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
          <p style={{ fontSize: "11px", color: "#333", margin: "10px 0 0" }}>GHL integration coming soon — live metrics will populate automatically.</p>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: "52px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>🚀 Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            {QUICK_LINKS.map(link => {
              const Icon = link.icon
              const isLive = link.url !== "#"
              return (
                <a
                  key={link.label}
                  href={isLive ? link.url : undefined}
                  target={isLive ? "_blank" : undefined}
                  rel="noreferrer"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${isLive ? `${link.color}30` : "rgba(255,255,255,0.07)"}`,
                    borderRadius: "14px",
                    padding: "20px",
                    textDecoration: "none",
                    display: "block",
                    cursor: isLive ? "pointer" : "default",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: `${link.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={link.color} />
                    </div>
                    {isLive
                      ? <ExternalLink size={13} color="#555" />
                      : <span style={{ fontSize: "10px", color: "#444", background: "rgba(255,255,255,0.06)", borderRadius: "4px", padding: "2px 6px", fontWeight: 600, letterSpacing: "0.5px" }}>SOON</span>
                    }
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>{link.label}</div>
                  <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }}>{link.desc}</div>
                </a>
              )
            })}
          </div>
        </div>

        {/* Support Team */}
        <div style={{ marginBottom: "52px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "20px" }}>👥 Your Support Team</div>
          {deptGroups.filter(g => g.members.length > 0).map(group => (
            <div key={group.dept} style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: DEPT_COLORS[group.dept] }} />
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", letterSpacing: "1px", textTransform: "uppercase" as const }}>{group.dept}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "10px" }}>
                {group.members.map(member => {
                  const isHovered = hoveredMember === member.name
                  return (
                    <div
                      key={member.name}
                      onMouseEnter={() => setHoveredMember(member.name)}
                      onMouseLeave={() => setHoveredMember(null)}
                      style={{
                        background: isHovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isHovered ? `${member.color}30` : "rgba(255,255,255,0.07)"}`,
                        borderRadius: "12px",
                        padding: "16px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        transition: "all 0.15s",
                        cursor: "default",
                        position: "relative" as const,
                      }}
                    >
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: `${member.color}20`, border: `2px solid ${member.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: member.color }}>
                        <img src={member.photo} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
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
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Support Channels */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>💭 Support Channels</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
            {SUPPORT_CHANNELS.map(ch => (
              <div key={ch.tag} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ background: "rgba(45,98,255,0.12)", border: "1px solid rgba(45,98,255,0.2)", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, color: "#2d62ff", whiteSpace: "nowrap" as const, flexShrink: 0 }}>{ch.tag}</div>
                <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.5, paddingTop: "2px" }}>{ch.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
