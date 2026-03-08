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

export default function QCDashboardClient({ reports }: { reports: QCReport[] }) {
  const [filterClient, setFilterClient] = useState("all")
  const [filterRep, setFilterRep] = useState("all")
  const [sortBy, setSortBy] = useState<"date" | "score" | "show_rate">("date")
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
      return b.report_date.localeCompare(a.report_date)
    })
  }, [reports, filterClient, filterRep, sortBy])

  // Summary stats
  const avgScore = filtered.length ? Math.round(filtered.reduce((s, r) => s + (r.score_pct ?? 0), 0) / filtered.filter(r => r.score_pct != null).length) : 0
  const avgShowRate = filtered.length ? Math.round(filtered.reduce((s, r) => s + (r.show_rate ?? 0), 0) / filtered.filter(r => r.show_rate != null).length) : 0
  const totalOverdue = filtered.reduce((s, r) => s + r.overdue_tasks_count, 0)
  const totalHygiene = filtered.reduce((s, r) => s + r.pipeline_hygiene_issues, 0)

  const sel = { background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px", padding: "7px 12px", outline: "none", cursor: "pointer" } as React.CSSProperties

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
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

        {/* Summary KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Avg QC Score", value: `${avgScore}%`, color: avgScore >= 70 ? "#8ceb4c" : "#f59e0b" },
            { label: "Avg Show Rate", value: `${avgShowRate}%`, color: avgShowRate >= 70 ? "#8ceb4c" : "#f59e0b" },
            { label: "Total Overdue Tasks", value: totalOverdue.toString(), color: totalOverdue > 10 ? "#ff5555" : "#f59e0b" },
            { label: "Pipeline Issues", value: totalHygiene.toString(), color: totalHygiene > 5 ? "#ff5555" : "#8ceb4c" },
          ].map(k => (
            <div key={k.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "26px", fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>{k.label}</div>
              <div style={{ fontSize: "11px", color: "#333", marginTop: "2px" }}>{filtered.length} reports</div>
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
            <option value="score" style={{ background: "#111" }}>Sort: Score</option>
            <option value="show_rate" style={{ background: "#111" }}>Sort: Show Rate</option>
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
                    {["Date","Client","Rep","Score","Show Rate","Close Rate","Appts","Overdue","Pipeline Issues","Deals"].map(h => (
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
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500, color: "#fff" }}>{r.rep_name}</td>
                      <td style={{ padding: "14px 16px" }}><ScoreBadge score={r.score_pct} rank={r.rank} /></td>
                      <td style={{ padding: "14px 16px", minWidth: "100px" }}><MiniBar value={r.show_rate ?? 0} max={100} color="#8ceb4c" /></td>
                      <td style={{ padding: "14px 16px", minWidth: "100px" }}><MiniBar value={r.close_rate ?? 0} max={100} color="#2d62ff" /></td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#aaa" }}>
                        {r.appts_shows}✓ / {r.appts_total}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: r.overdue_tasks_count > 5 ? "#ff5555" : r.overdue_tasks_count > 0 ? "#f59e0b" : "#8ceb4c" }}>
                          {r.overdue_tasks_count}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: r.pipeline_hygiene_issues > 5 ? "#ff5555" : r.pipeline_hygiene_issues > 0 ? "#f59e0b" : "#8ceb4c" }}>
                          {r.pipeline_hygiene_issues}
                        </span>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
            {filtered.map(r => {
              const scoreColor = r.score_pct == null ? "#555" : r.score_pct >= 80 ? "#8ceb4c" : r.score_pct >= 60 ? "#f59e0b" : "#ff5555"
              return (
                <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${scoreColor}25`, borderRadius: "14px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{r.rep_name}</div>
                      <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>{r.client} · {r.report_date}</div>
                    </div>
                    <ScoreBadge score={r.score_pct} rank={r.rank} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                    {[
                      { label: "Show Rate", value: `${r.show_rate ?? 0}%`, color: (r.show_rate ?? 0) >= 70 ? "#8ceb4c" : "#f59e0b" },
                      { label: "Close Rate", value: `${r.close_rate ?? 0}%`, color: (r.close_rate ?? 0) >= 20 ? "#8ceb4c" : "#f59e0b" },
                      { label: "Appts", value: `${r.appts_shows}/${r.appts_total}`, color: "#aaa" },
                      { label: "Active Deals", value: r.active_deals.toString(), color: "#aaa" },
                    ].map(s => (
                      <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "10px" }}>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "8px", textAlign: "center" as const }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: r.overdue_tasks_count > 5 ? "#ff5555" : r.overdue_tasks_count > 0 ? "#f59e0b" : "#8ceb4c" }}>{r.overdue_tasks_count}</span>
                      <div style={{ fontSize: "10px", color: "#444" }}>Overdue</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "8px", textAlign: "center" as const }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: r.pipeline_hygiene_issues > 5 ? "#ff5555" : r.pipeline_hygiene_issues > 0 ? "#f59e0b" : "#8ceb4c" }}>{r.pipeline_hygiene_issues}</span>
                      <div style={{ fontSize: "10px", color: "#444" }}>Pipeline Issues</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "8px", textAlign: "center" as const }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: r.unread_convos > 3 ? "#ff5555" : "#aaa" }}>{r.unread_convos}</span>
                      <div style={{ fontSize: "10px", color: "#444" }}>Unread</div>
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
