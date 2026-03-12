import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const RESEND_KEY = process.env.RESEND_API_KEY!
const CRON_SECRET = process.env.CRON_SECRET || ""
const SB_HEADERS = { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" }

export async function GET(req: NextRequest) {
  // Auth: Vercel cron or secret header
  const authHeader = req.headers.get("authorization")
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const etNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const currentHour = etNow.getHours()
  const currentMin = etNow.getMinutes()
  const currentDay = etNow.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/New_York" }).toLowerCase()
  const currentDate = etNow.getDate()
  const lastDayOfMonth = new Date(etNow.getFullYear(), etNow.getMonth() + 1, 0).getDate()

  // Fetch all active alerts
  const alertsRes = await fetch(`${SUPABASE_URL}/rest/v1/hub_alerts?active=eq.true`, { headers: SB_HEADERS })
  const alerts = await alertsRes.json()

  const sent: string[] = []
  const skipped: string[] = []

  for (const alert of alerts) {
    // Parse send_time
    const [sendHour, sendMin] = alert.send_time.split(":").map(Number)

    // Check if within 15-min window of send time
    const alertMinutes = sendHour * 60 + sendMin
    const currentMinutes = currentHour * 60 + currentMin
    if (Math.abs(currentMinutes - alertMinutes) > 15) {
      skipped.push(`${alert.id}: wrong time (${alert.send_time} vs ${currentHour}:${String(currentMin).padStart(2, "0")})`)
      continue
    }

    // Check frequency
    if (alert.frequency === "weekly" && alert.send_day !== currentDay) {
      skipped.push(`${alert.id}: wrong day (${alert.send_day} vs ${currentDay})`)
      continue
    }
    if (alert.frequency === "monthly") {
      const targetDay = alert.send_month_day === "last" ? lastDayOfMonth : parseInt(alert.send_month_day || "1")
      if (currentDate !== targetDay) {
        skipped.push(`${alert.id}: wrong date (${targetDay} vs ${currentDate})`)
        continue
      }
    }
    if (alert.frequency === "once" && alert.last_sent_at) {
      skipped.push(`${alert.id}: already sent (once)`)
      continue
    }

    // Check if already sent today
    if (alert.last_sent_at) {
      const lastSent = new Date(alert.last_sent_at)
      const lastSentET = new Date(lastSent.toLocaleString("en-US", { timeZone: "America/New_York" }))
      if (lastSentET.toDateString() === etNow.toDateString()) {
        skipped.push(`${alert.id}: already sent today`)
        continue
      }
    }

    // Find recipients: match client + role
    let roleFilter = ""
    if (alert.target_role === "closer") roleFilter = "&rep_type=eq.closer"
    else if (alert.target_role === "setter") roleFilter = "&rep_type=eq.setter"
    else if (alert.target_role === "client") roleFilter = "&role=eq.client"
    // "all" = no extra filter

    const clientFilter = `&client=eq.${encodeURIComponent(alert.client)}`
    const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/manager_profiles?select=email${clientFilter}${roleFilter}`, { headers: SB_HEADERS })
    const users = await usersRes.json()

    if (!users.length) {
      skipped.push(`${alert.id}: no recipients for ${alert.target_role} @ ${alert.client}`)
      continue
    }

    // Send emails via Resend
    const emails = users.map((u: { email: string }) => u.email)
    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Systemized Sales <alerts@systemizedsales.com>",
          to: emails,
          subject: alert.title,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
              <div style="background: #050508; border-radius: 12px; padding: 32px; color: #d4d4d4;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                  <span style="color: #8ceb4c; font-size: 20px;">🔔</span>
                  <h1 style="margin: 0; font-size: 20px; color: #fff;">${alert.title}</h1>
                </div>
                <p style="font-size: 15px; line-height: 1.6; color: #bbb; margin: 0 0 24px;">${alert.message.replace(/\n/g, "<br>")}</p>
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 16px;">
                  <a href="https://app.systemizedsales.com" style="color: #8ceb4c; text-decoration: none; font-size: 13px;">Open Dashboard →</a>
                </div>
              </div>
              <p style="text-align: center; margin-top: 16px; font-size: 11px; color: #666;">Systemized Sales · ${alert.client}</p>
            </div>
          `,
        }),
      })
      if (emailRes.ok) {
        // Update last_sent_at
        await fetch(`${SUPABASE_URL}/rest/v1/hub_alerts?id=eq.${alert.id}`, {
          method: "PATCH",
          headers: SB_HEADERS,
          body: JSON.stringify({ last_sent_at: new Date().toISOString() }),
        })
        sent.push(`${alert.id}: sent to ${emails.join(", ")}`)
      } else {
        const err = await emailRes.text()
        skipped.push(`${alert.id}: Resend error: ${err.slice(0, 100)}`)
      }
    } catch (e) {
      skipped.push(`${alert.id}: error: ${String(e).slice(0, 100)}`)
    }
  }

  return NextResponse.json({ sent, skipped, checked: alerts.length, time: etNow.toISOString() })
}
