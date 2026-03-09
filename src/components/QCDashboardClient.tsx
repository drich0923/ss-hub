"use client"
import { useState, useMemo, useEffect, useCallback } from "react"

type QCReport = {
  id: string
  client: string
  rep_name: string
  report_date: string
  score_pct: number | null
  checks_passed: number | null
  checks_total: number | null
  rank: string | null
  unread_convos: number
  overdue_tasks_count: number
  appts_total: number
  appts_shows: number
  appts_no_shows: number
  appts_cancelled: number
  appts_rescheduled: number
  appts_closed: number
  show_rate: number
  close_rate: number
  no_show_rate: number | null
  active_deals: number
  pipeline_hygiene_issues: number
  slack_ts: string | null
  slack_channel: string | null
  productivity_rate: number | null
  pre_call_pct: number | null
  during_call_pct: number | null
  post_call_pct: number | null
  avg_dials: number | null
  avg_sms: number | null
  avg_emails: number | null
  avg_talk_time_min: number | null
}

const RANK_COLORS: Record<string, string> = {
  Rookie: "#f59e0b",
  Pro: "#8ceb4c",
  Elite: "#2d62ff",
  Champion: "#a78bfa",
}

function ScoreBadge({ score, rank }: { score: number | null; rank: string | null }) {
  const color = score == null ? "#555" : score >= 80 ? "#8ceb4c" : score >= 60 ? "#f59e0b" : "#ff5555"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ fontSize: "18px", fontWeight: 800, color }}>{score != null ? `${score}%` : "—"}</div>
      {rank && <span style={{ fontSize: "10px", fontWeight: 600, color: RANK_COLORS[rank] ?? "#555", background: `${RANK_COLORS[rank] ?? "#555"}15`, borderRadius: "4px", padding: "2px 6px" }}>{rank}</span>}
    </div>
  )
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "2px" }} />
      </div>
      <span style={{ fontSize: "11px", color: "#aaa", minWidth: "28px" }}>{value}%</span>
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "8px 10px" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: color ?? "#fff" }}>{value}</div>
      <div style={{ fontSize: "10px", color: "#444", marginTop: "1px" }}>{label}</div>
    </div>
  )
}

function slackThreadUrl(channel: string, ts: string) {
  return `https://systemizedsales.slack.com/archives/${channel}/p${ts.replace(".", "")}`
}

function scoreColor(score: number | null) {
  return score == null ? "#555" : score >= 80 ? "#8ceb4c" : score >= 60 ? "#f59e0b" : "#ff5555"
}

function ModalMetric({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
      <div style={{ fontSize: "20px", fontWeight: 700, color: color ?? "#fff" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>{label}</div>
      {sub && <div style={{ fontSize: "10px", color: "#333", marginTop: "1px" }}>{sub}</div>}
    </div>
  )
}

type QCAppointment = {
  id: string
  report_id: string
  contact_name: string
  contact_ghl_url: string | null
  meeting_type: string | null
  appt_time: string | null
  call_outcome: string | null
  pre_call_pass: boolean | null
  pre_call_msg_count: number | null
  pre_call_note: string | null
  post_call_stage_moved: boolean | null
  post_call_task_assigned: boolean | null
  post_call_pcn_complete: boolean | null
  next_task: string | null
  next_appt_date: string | null
}

type QCPipelineIssue = {
  id: string
  report_id: string
  issue_type: string
  contact_name: string
  contact_ghl_url: string | null
  pipeline_stage: string | null
  days_stale: number | null
  last_activity_date: string | null
}

const ISSUE_LABELS: Record<string, string> = {
  overdue_task: "Overdue Tasks",
  red_zone_missing_task: "Red Zone — Missing Task",
  open_deals_missing_task: "Open Deals — Missing Task",
  unassigned_opp: "Unassigned Opportunities",
}

function CheckIcon({ pass }: { pass: boolean | null }) {
  return <span style={{ fontSize: "13px", color: pass ? "#8ceb4c" : "#ff5555" }}>{pass ? "✓" : "✗"}</span>
}

function ReportDetailModal({ report: r, onClose }: { report: QCReport; onClose: () => void }) {
  const [detail, setDetail] = useState<{ appointments: QCAppointment[]; pipeline_issues: QCPipelineIssue[] } | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  useEffect(() => {
    setDetailLoading(true)
    fetch(`/api/qc-report-detail?report_id=${r.id}`)
      .then(res => res.json())
      .then(data => setDetail(data))
      .catch(() => setDetail({ appointments: [], pipeline_issues: [] }))
      .finally(() => setDetailLoading(false))
  }, [r.id])

  const sc = scoreColor(r.score_pct)
  const slackUrl = r.slack_ts && r.slack_channel ? slackThreadUrl(r.slack_channel, r.slack_ts) : null

  const groupedIssues = useMemo(() => {
    if (!detail?.pipeline_issues.length) return {}
    const groups: Record<string, QCPipelineIssue[]> = {}
    for (const issue of detail.pipeline_issues) {
      const key = issue.issue_type || "other"
      if (!groups[key]) groups[key] = []
      groups[key].push(issue)
    }
    return groups
  }, [detail?.pipeline_issues])

  const sectionDivider = { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", marginBottom: "24px" } as const
  const sectionLabel = { fontSize: "11px", fontWeight: 600, color: "#555", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" } as React.CSSProperties

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "780px", maxHeight: "90vh", overflowY: "auto", background: "#0a0a10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "32px", position: "relative" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap", paddingRight: "80px" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>{r.rep_name}</div>
            <span style={{ fontSize: "11px", background: "rgba(140,235,76,0.1)", border: "1px solid rgba(140,235,76,0.2)", borderRadius: "4px", padding: "3px 10px", color: "#8ceb4c" }}>{r.client}</span>
          </div>
          <div style={{ fontSize: "12px", color: "#555", marginBottom: "12px" }}>{r.report_date}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "36px", fontWeight: 800, color: sc }}>{r.score_pct != null ? `${r.score_pct}%` : "—"}</div>
            {r.rank && <span style={{ fontSize: "12px", fontWeight: 600, color: RANK_COLORS[r.rank] ?? "#555", background: `${RANK_COLORS[r.rank] ?? "#555"}15`, borderRadius: "6px", padding: "4px 10px" }}>{r.rank}</span>}
          </div>
          <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>{r.checks_passed ?? 0} / {r.checks_total ?? 0} checks passed</div>
        </div>

        {/* Top-right buttons */}
        <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }}>
          {slackUrl && (
            <a href={slackUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#7090ff", background: "rgba(45,98,255,0.08)", border: "1px solid rgba(45,98,255,0.2)", borderRadius: "8px", padding: "6px 14px", textDecoration: "none", fontWeight: 500 }}>View in Slack</a>
          )}
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888", fontSize: "16px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Score Breakdown */}
        {(r.pre_call_pct != null || r.during_call_pct != null || r.post_call_pct != null) && (
          <div style={sectionDivider}>
            <div style={sectionLabel}>Score Breakdown</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div style={{ background: "rgba(140,235,76,0.06)", border: "1px solid rgba(140,235,76,0.12)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: scoreColor(r.pre_call_pct) }}>{r.pre_call_pct != null ? `${r.pre_call_pct}%` : "—"}</div>
                <div style={{ fontSize: "10px", color: "#555", marginTop: "3px" }}>PRE-CALL</div>
              </div>
              <div style={{ background: "rgba(45,98,255,0.06)", border: "1px solid rgba(45,98,255,0.12)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: scoreColor(r.during_call_pct) }}>{r.during_call_pct != null ? `${r.during_call_pct}%` : "—"}</div>
                <div style={{ fontSize: "10px", color: "#555", marginTop: "3px" }}>DURING CALL</div>
              </div>
              <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: scoreColor(r.post_call_pct) }}>{r.post_call_pct != null ? `${r.post_call_pct}%` : "—"}</div>
                <div style={{ fontSize: "10px", color: "#555", marginTop: "3px" }}>POST-CALL</div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Summary */}
        <div style={sectionDivider}>
          <div style={sectionLabel}>Appointments Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", marginBottom: "10px" }}>
            <ModalMetric label="Total" value={r.appts_total.toString()} />
            <ModalMetric label="Shows" value={r.appts_shows.toString()} color="#8ceb4c" />
            <ModalMetric label="No-Shows" value={r.appts_no_shows.toString()} color={r.appts_no_shows > 0 ? "#ff5555" : "#8ceb4c"} />
            <ModalMetric label="Cancelled" value={(r.appts_cancelled ?? 0).toString()} color={(r.appts_cancelled ?? 0) > 0 ? "#f59e0b" : "#8ceb4c"} />
            <ModalMetric label="Rescheduled" value={(r.appts_rescheduled ?? 0).toString()} color="#aaa" />
            <ModalMetric label="Closed" value={(r.appts_closed ?? 0).toString()} color={(r.appts_closed ?? 0) > 0 ? "#8ceb4c" : "#aaa"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <ModalMetric label="Show Rate" value={`${r.show_rate ?? 0}%`} color={(r.show_rate ?? 0) >= 70 ? "#8ceb4c" : "#f59e0b"} />
            <ModalMetric label="Close Rate" value={`${r.close_rate ?? 0}%`} color={(r.close_rate ?? 0) >= 20 ? "#8ceb4c" : "#f59e0b"} />
            <ModalMetric label="No-Show Rate" value={`${r.no_show_rate ?? 0}%`} color={(r.no_show_rate ?? 0) > 20 ? "#ff5555" : "#8ceb4c"} />
          </div>
        </div>

        {/* Activity */}
        {(r.avg_dials != null || r.avg_sms != null || r.avg_emails != null || r.avg_talk_time_min != null || r.productivity_rate != null) && (
          <div style={sectionDivider}>
            <div style={sectionLabel}>Activity</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {r.avg_dials != null && <ModalMetric label="Dials" value={r.avg_dials.toString()} />}
              {r.avg_sms != null && <ModalMetric label="SMS" value={r.avg_sms.toString()} />}
              {r.avg_emails != null && <ModalMetric label="Emails" value={r.avg_emails.toString()} />}
              {r.avg_talk_time_min != null && <ModalMetric label="Talk Time" value={`${r.avg_talk_time_min}m`} />}
              {r.productivity_rate != null && <ModalMetric label="Productivity Rate" value={`${r.productivity_rate}%`} color={r.productivity_rate >= 70 ? "#8ceb4c" : "#f59e0b"} />}
            </div>
          </div>
        )}

        {/* Pipeline Health */}
        <div style={sectionDivider}>
          <div style={sectionLabel}>Pipeline Health</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            <ModalMetric label="Overdue Tasks" value={r.overdue_tasks_count.toString()} color={r.overdue_tasks_count > 0 ? "#ff5555" : "#8ceb4c"} />
            <ModalMetric label="Pipeline Issues" value={r.pipeline_hygiene_issues.toString()} color={r.pipeline_hygiene_issues > 0 ? "#ff5555" : "#8ceb4c"} />
            <ModalMetric label="Unread Convos" value={r.unread_convos.toString()} color={r.unread_convos > 0 ? "#ff5555" : "#8ceb4c"} />
            <ModalMetric label="Active Deals" value={r.active_deals.toString()} color="#aaa" />
          </div>
        </div>

        {/* Appointment Audit */}
        <div style={sectionDivider}>
          <div style={sectionLabel}>Appointment Audit</div>
          {detailLoading ? (
            <div style={{ fontSize: "12px", color: "#555", padding: "16px 0" }}>Loading...</div>
          ) : !detail?.appointments.length ? (
            <div style={{ fontSize: "12px", color: "#444", padding: "16px 0" }}>No appointment detail available</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {detail.appointments.map(a => (
                <div key={a.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    {a.contact_ghl_url ? (
                      <a href={a.contact_ghl_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", fontWeight: 600, color: "#7090ff", textDecoration: "none" }}>{a.contact_name}</a>
                    ) : (
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{a.contact_name}</span>
                    )}
                    {a.meeting_type && <span style={{ fontSize: "10px", background: "rgba(45,98,255,0.1)", border: "1px solid rgba(45,98,255,0.15)", borderRadius: "4px", padding: "2px 6px", color: "#7090ff" }}>{a.meeting_type}</span>}
                    {a.appt_time && <span style={{ fontSize: "11px", color: "#555", marginLeft: "auto" }}>{a.appt_time}</span>}
                  </div>
                  {a.call_outcome && (
                    <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
                      <span style={{ color: a.call_outcome.toLowerCase().includes("show") && !a.call_outcome.toLowerCase().includes("no") ? "#8ceb4c" : "#ff5555", marginRight: "4px" }}>{a.call_outcome.toLowerCase().includes("show") && !a.call_outcome.toLowerCase().includes("no") ? "✓" : "✗"}</span>
                      {a.call_outcome}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", marginBottom: a.next_task || a.next_appt_date ? "8px" : "0" }}>
                    <div style={{ color: "#888" }}>
                      <span style={{ color: "#555", marginRight: "4px" }}>Pre-Call:</span>
                      <CheckIcon pass={a.pre_call_pass} />
                      {a.pre_call_msg_count != null && <span style={{ color: "#555", marginLeft: "6px" }}>{a.pre_call_msg_count} msgs</span>}
                      {a.pre_call_note && <span style={{ color: "#444", marginLeft: "6px", fontStyle: "italic" }}>{a.pre_call_note}</span>}
                    </div>
                    <div style={{ color: "#888" }}>
                      <span style={{ color: "#555", marginRight: "4px" }}>Post-Call:</span>
                      <span style={{ marginRight: "6px" }}>Stage <CheckIcon pass={a.post_call_stage_moved} /></span>
                      <span style={{ marginRight: "6px" }}>Task <CheckIcon pass={a.post_call_task_assigned} /></span>
                      <span>PCN <CheckIcon pass={a.post_call_pcn_complete} /></span>
                    </div>
                  </div>
                  {(a.next_task || a.next_appt_date) && (
                    <div style={{ fontSize: "11px", color: "#555", display: "flex", gap: "12px" }}>
                      {a.next_task && <span>Next: {a.next_task}</span>}
                      {a.next_appt_date && <span>Next Appt: {a.next_appt_date}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline Issues Detail */}
        {!detailLoading && detail?.pipeline_issues && detail.pipeline_issues.length > 0 && (
          <div style={sectionDivider}>
            <div style={sectionLabel}>Pipeline Issues</div>
            {Object.entries(groupedIssues).map(([type, issues]) => (
              <div key={type} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", marginBottom: "6px" }}>{ISSUE_LABELS[type] || type}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {issues.map(issue => (
                    <div key={issue.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
                      {issue.contact_ghl_url ? (
                        <a href={issue.contact_ghl_url} target="_blank" rel="noopener noreferrer" style={{ color: "#7090ff", textDecoration: "none", fontWeight: 500, minWidth: "120px" }}>{issue.contact_name}</a>
                      ) : (
                        <span style={{ color: "#fff", fontWeight: 500, minWidth: "120px" }}>{issue.contact_name}</span>
                      )}
                      {issue.pipeline_stage && <span style={{ color: "#555" }}>{issue.pipeline_stage}</span>}
                      {issue.days_stale != null && <span style={{ color: issue.days_stale > 7 ? "#ff5555" : "#f59e0b", marginLeft: "auto", whiteSpace: "nowrap" }}>{issue.days_stale}d stale</span>}
                      {issue.last_activity_date && <span style={{ color: "#444", whiteSpace: "nowrap" }}>Last: {issue.last_activity_date}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default function QCDashboardClient({ reports }: { reports: QCReport[] }) {
  const [filterClient, setFilterClient] = useState("all")
  const [filterRep, setFilterRep] = useState("all")
  const [sortBy, setSortBy] = useState<"date" | "score" | "show_rate" | "close_rate">("date")
  const [view, setView] = useState<"table" | "cards">("table")
  const [selectedReport, setSelectedReport] = useState<QCReport | null>(null)
  const closeModal = useCallback(() => setSelectedReport(null), [])

  const clients = useMemo(() => ["all", ...Array.from(new Set(reports.map(r => r.client)))], [reports])
  const reps = useMemo(() => {
    const pool = filterClient === "all" ? reports : reports.filter(r => r.client === filterClient)
    return ["all", ...Array.from(new Set(pool.map(r => r.rep_name)))]
  }, [reports, filterClient])

  const filtered = useMemo(() => {
    let r = reports
    if (filterClient !== "all") r = r.filter(x => x.client === filterClient)
    if (filterRep !== "all") r = r.filter(x => x.rep_name === filterRep)
    return [...r].sort((a, b) => {
      if (sortBy === "score") return (b.score_pct ?? 0) - (a.score_pct ?? 0)
      if (sortBy === "show_rate") return (b.show_rate ?? 0) - (a.show_rate ?? 0)
      if (sortBy === "close_rate") return (b.close_rate ?? 0) - (a.close_rate ?? 0)
      return b.report_date.localeCompare(a.report_date)
    })
  }, [reports, filterClient, filterRep, sortBy])

  const withScore = filtered.filter(r => r.score_pct != null)
  const avgScore = withScore.length ? Math.round(withScore.reduce((s, r) => s + (r.score_pct ?? 0), 0) / withScore.length) : null
  const withShow = filtered.filter(r => r.show_rate != null)
  const avgShowRate = withShow.length ? Math.round(withShow.reduce((s, r) => s + (r.show_rate ?? 0), 0) / withShow.length) : null
  const withClose = filtered.filter(r => r.close_rate != null)
  const avgCloseRate = withClose.length ? Math.round(withClose.reduce((s, r) => s + (r.close_rate ?? 0), 0) / withClose.length) : null
  const withProd = filtered.filter(r => r.productivity_rate != null)
  const avgProductivity = withProd.length ? Math.round(withProd.reduce((s, r) => s + (r.productivity_rate ?? 0), 0) / withProd.length) : null

  const totalOverdue = filtered.reduce((s, r) => s + r.overdue_tasks_count, 0)
  const totalPipeline = filtered.reduce((s, r) => s + r.pipeline_hygiene_issues, 0)
  const totalUnread = filtered.reduce((s, r) => s + r.unread_convos, 0)

  const sel = { background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px", padding: "7px 12px", outline: "none", cursor: "pointer" } as React.CSSProperties

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/" style={{ color: "#555", fontSize: "12px", textDecoration: "none" }}>← Hub</a>
          <div style={{ width: "1px", height: "14px", background: "#222" }} />
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700 }}>GHL QC Dashboard</div>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "1px" }}>Rep performance · SOP compliance · Pipeline hygiene</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["table","cards"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ ...sel, background: view === v ? "rgba(255,255,255,0.08)" : "transparent", border: view === v ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent" }}>
              {v === "table" ? "Table" : "Cards"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>

        {/* KPI Row 1 — Performance */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
          {[
            { label: "Avg QC Score", value: avgScore != null ? `${avgScore}%` : "—", color: avgScore != null ? (avgScore >= 70 ? "#8ceb4c" : "#f59e0b") : "#555", sub: "SOP compliance" },
            { label: "Avg Show Rate", value: avgShowRate != null ? `${avgShowRate}%` : "—", color: avgShowRate != null ? (avgShowRate >= 70 ? "#8ceb4c" : "#f59e0b") : "#555", sub: "Appts showed" },
            { label: "Avg Close Rate", value: avgCloseRate != null ? `${avgCloseRate}%` : "—", color: avgCloseRate != null ? (avgCloseRate >= 20 ? "#8ceb4c" : "#f59e0b") : "#555", sub: "Closed / showed" },
            { label: "Avg Productivity", value: avgProductivity != null ? `${avgProductivity}%` : "—", color: avgProductivity != null ? (avgProductivity >= 70 ? "#8ceb4c" : "#f59e0b") : "#555", sub: "Activity rate" },
          ].map(k => (
            <div key={k.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "26px", fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>{k.label}</div>
              <div style={{ fontSize: "11px", color: "#333", marginTop: "2px" }}>{k.sub} · {filtered.length} reports</div>
            </div>
          ))}
        </div>

        {/* KPI Row 2 — Issues */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Current Overdue Tasks", value: totalOverdue.toString(), color: totalOverdue > 10 ? "#ff5555" : totalOverdue > 0 ? "#f59e0b" : "#8ceb4c", sub: "Snapshot at report time" },
            { label: "Current Pipeline Issues", value: totalPipeline.toString(), color: totalPipeline > 5 ? "#ff5555" : totalPipeline > 0 ? "#f59e0b" : "#8ceb4c", sub: "Hygiene flags" },
            { label: "Convos Needing Reply", value: totalUnread.toString(), color: totalUnread > 5 ? "#ff5555" : totalUnread > 0 ? "#f59e0b" : "#8ceb4c", sub: "Unread / active" },
            { label: "Active Deals", value: filtered.reduce((s, r) => s + r.active_deals, 0).toString(), color: "#aaa", sub: "Total in pipeline" },
          ].map(k => (
            <div key={k.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "26px", fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>{k.label}</div>
              <div style={{ fontSize: "11px", color: "#333", marginTop: "2px" }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" as const, alignItems: "center" }}>
          <select value={filterClient} onChange={e => { setFilterClient(e.target.value); setFilterRep("all") }} style={sel}>
            {clients.map(c => <option key={c} value={c} style={{ background: "#111" }}>{c === "all" ? "All Clients" : c}</option>)}
          </select>
          <select value={filterRep} onChange={e => setFilterRep(e.target.value)} style={sel}>
            {reps.map(r => <option key={r} value={r} style={{ background: "#111" }}>{r === "all" ? "All Reps" : r}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={sel}>
            <option value="date" style={{ background: "#111" }}>Sort: Date</option>
            <option value="score" style={{ background: "#111" }}>Sort: QC Score</option>
            <option value="show_rate" style={{ background: "#111" }}>Sort: Show Rate</option>
            <option value="close_rate" style={{ background: "#111" }}>Sort: Close Rate</option>
          </select>
          <span style={{ fontSize: "12px", color: "#444", marginLeft: "4px" }}>{filtered.length} report{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table View */}
        {view === "table" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Date","Client","Rep","QC Score","Show Rate","Close Rate","Pre / During / Post","Activity","Overdue","Pipeline","Convos","Deals"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#444", fontSize: "11px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} onClick={() => setSelectedReport(r)} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#888", whiteSpace: "nowrap" as const }}>{r.report_date}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "11px", background: "rgba(45,98,255,0.1)", border: "1px solid rgba(45,98,255,0.2)", borderRadius: "4px", padding: "2px 8px", color: "#7090ff" }}>{r.client}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500, color: "#fff", whiteSpace: "nowrap" as const }}>{r.rep_name}</td>
                      <td style={{ padding: "14px 16px" }}><ScoreBadge score={r.score_pct} rank={r.rank} /></td>
                      <td style={{ padding: "14px 16px", minWidth: "100px" }}><MiniBar value={r.show_rate ?? 0} max={100} color="#8ceb4c" /></td>
                      <td style={{ padding: "14px 16px", minWidth: "100px" }}><MiniBar value={r.close_rate ?? 0} max={100} color="#2d62ff" /></td>
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" as const }}>
                        {(r.pre_call_pct != null || r.during_call_pct != null || r.post_call_pct != null) ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <span style={{ fontSize: "11px", background: "rgba(140,235,76,0.1)", borderRadius: "4px", padding: "2px 5px", color: "#8ceb4c" }}>Pre {r.pre_call_pct ?? "—"}%</span>
                            <span style={{ fontSize: "11px", background: "rgba(45,98,255,0.1)", borderRadius: "4px", padding: "2px 5px", color: "#7090ff" }}>Mid {r.during_call_pct ?? "—"}%</span>
                            <span style={{ fontSize: "11px", background: "rgba(167,139,250,0.1)", borderRadius: "4px", padding: "2px 5px", color: "#a78bfa" }}>Post {r.post_call_pct ?? "—"}%</span>
                          </div>
                        ) : <span style={{ color: "#333", fontSize: "12px" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" as const }}>
                        {(r.avg_dials != null || r.avg_talk_time_min != null) ? (
                          <div style={{ fontSize: "11px", color: "#888", lineHeight: "1.7" }}>
                            {r.avg_dials != null && <div>📞 {r.avg_dials} dials</div>}
                            {r.avg_sms != null && <div>💬 {r.avg_sms} SMS</div>}
                            {r.avg_talk_time_min != null && <div>⏱ {r.avg_talk_time_min}m</div>}
                          </div>
                        ) : <span style={{ color: "#333", fontSize: "12px" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: r.overdue_tasks_count > 5 ? "#ff5555" : r.overdue_tasks_count > 0 ? "#f59e0b" : "#8ceb4c" }}>{r.overdue_tasks_count}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: r.pipeline_hygiene_issues > 5 ? "#ff5555" : r.pipeline_hygiene_issues > 0 ? "#f59e0b" : "#8ceb4c" }}>{r.pipeline_hygiene_issues}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: r.unread_convos > 3 ? "#ff5555" : r.unread_convos > 0 ? "#f59e0b" : "#8ceb4c" }}>{r.unread_convos}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#aaa" }}>{r.active_deals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px", color: "#444", fontSize: "13px" }}>No reports found for selected filters.</div>
            )}
          </div>
        )}

        {/* Cards View */}
        {view === "cards" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "14px" }}>
            {filtered.map(r => {
              const cardScoreColor = r.score_pct == null ? "#555" : r.score_pct >= 80 ? "#8ceb4c" : r.score_pct >= 60 ? "#f59e0b" : "#ff5555"
              return (
                <div key={r.id} onClick={() => setSelectedReport(r)} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${cardScoreColor}25`, borderRadius: "14px", padding: "20px", cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{r.rep_name}</div>
                      <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>{r.client} · {r.report_date}</div>
                    </div>
                    <ScoreBadge score={r.score_pct} rank={r.rank} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                    <StatPill label="Show Rate" value={`${r.show_rate ?? 0}%`} color={(r.show_rate ?? 0) >= 70 ? "#8ceb4c" : "#f59e0b"} />
                    <StatPill label="Close Rate" value={`${r.close_rate ?? 0}%`} color={(r.close_rate ?? 0) >= 20 ? "#8ceb4c" : "#f59e0b"} />
                    <StatPill label="Productivity" value={r.productivity_rate != null ? `${r.productivity_rate}%` : "—"} color={r.productivity_rate != null ? (r.productivity_rate >= 70 ? "#8ceb4c" : "#f59e0b") : "#444"} />
                    <StatPill label="Active Deals" value={r.active_deals.toString()} />
                  </div>

                  {(r.pre_call_pct != null || r.during_call_pct != null || r.post_call_pct != null) && (
                    <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                      <div style={{ flex: 1, background: "rgba(140,235,76,0.06)", border: "1px solid rgba(140,235,76,0.12)", borderRadius: "6px", padding: "6px 8px", textAlign: "center" as const }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#8ceb4c" }}>{r.pre_call_pct ?? "—"}{r.pre_call_pct != null ? "%" : ""}</div>
                        <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>PRE-CALL</div>
                      </div>
                      <div style={{ flex: 1, background: "rgba(45,98,255,0.06)", border: "1px solid rgba(45,98,255,0.12)", borderRadius: "6px", padding: "6px 8px", textAlign: "center" as const }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#7090ff" }}>{r.during_call_pct ?? "—"}{r.during_call_pct != null ? "%" : ""}</div>
                        <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>DURING</div>
                      </div>
                      <div style={{ flex: 1, background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)", borderRadius: "6px", padding: "6px 8px", textAlign: "center" as const }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#a78bfa" }}>{r.post_call_pct ?? "—"}{r.post_call_pct != null ? "%" : ""}</div>
                        <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>POST-CALL</div>
                      </div>
                    </div>
                  )}

                  {(r.avg_dials != null || r.avg_sms != null || r.avg_emails != null || r.avg_talk_time_min != null) && (
                    <div style={{ display: "flex", gap: "5px", marginBottom: "10px", flexWrap: "wrap" as const }}>
                      {r.avg_dials != null && <span style={{ fontSize: "11px", color: "#888", background: "rgba(255,255,255,0.04)", borderRadius: "4px", padding: "3px 7px" }}>📞 {r.avg_dials}</span>}
                      {r.avg_sms != null && <span style={{ fontSize: "11px", color: "#888", background: "rgba(255,255,255,0.04)", borderRadius: "4px", padding: "3px 7px" }}>💬 {r.avg_sms}</span>}
                      {r.avg_emails != null && <span style={{ fontSize: "11px", color: "#888", background: "rgba(255,255,255,0.04)", borderRadius: "4px", padding: "3px 7px" }}>✉️ {r.avg_emails}</span>}
                      {r.avg_talk_time_min != null && <span style={{ fontSize: "11px", color: "#888", background: "rgba(255,255,255,0.04)", borderRadius: "4px", padding: "3px 7px" }}>⏱ {r.avg_talk_time_min}m</span>}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "6px" }}>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "8px", textAlign: "center" as const }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: r.overdue_tasks_count > 5 ? "#ff5555" : r.overdue_tasks_count > 0 ? "#f59e0b" : "#8ceb4c" }}>{r.overdue_tasks_count}</div>
                      <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>Overdue</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "8px", textAlign: "center" as const }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: r.pipeline_hygiene_issues > 5 ? "#ff5555" : r.pipeline_hygiene_issues > 0 ? "#f59e0b" : "#8ceb4c" }}>{r.pipeline_hygiene_issues}</div>
                      <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>Pipeline</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "8px", textAlign: "center" as const }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: r.unread_convos > 3 ? "#ff5555" : r.unread_convos > 0 ? "#f59e0b" : "#aaa" }}>{r.unread_convos}</div>
                      <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>Convos</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {selectedReport && <ReportDetailModal report={selectedReport} onClose={closeModal} />}
    </div>
  )
}
