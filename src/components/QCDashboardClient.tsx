"use client"
import { useState, useMemo } from "react"

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
  show_rate: number
  close_rate: number
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

export default function QCDashboardClient({ reports }: { reports: QCReport[] }) {
  const [filterClient, setFilterClient] = useState("all")
  const [filterRep, setFilterRep] = useState("all")
  const [sortBy, setSortBy] = useState<"date" | "score" | "show_rate" | "close_rate">("date")
  const [view, setView] = useState<"table" | "cards">("table")

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
                    <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
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
              const scoreColor = r.score_pct == null ? "#555" : r.score_pct >= 80 ? "#8ceb4c" : r.score_pct >= 60 ? "#f59e0b" : "#ff5555"
              return (
                <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${scoreColor}25`, borderRadius: "14px", padding: "20px" }}>
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
    </div>
  )
}
