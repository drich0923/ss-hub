import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
}

async function query(table: string, params: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers })
  if (!res.ok) {
    console.error(`[ghl-data] query ${table} failed:`, await res.text())
    return []
  }
  return res.json()
}

async function count(table: string, params: string): Promise<number> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}&select=id`, {
    headers: { ...headers, Prefer: "count=exact" },
  })
  const countHeader = res.headers.get("content-range")
  if (!countHeader) return 0
  const total = countHeader.split("/")[1]
  return total === "*" ? 0 : parseInt(total, 10)
}

export async function GET(req: NextRequest) {
  const locationId = req.nextUrl.searchParams.get("location_id")
  if (!locationId) {
    return NextResponse.json({ error: "location_id required" }, { status: 400 })
  }

  const now = new Date().toISOString()

  const [opportunities, tasks, appointments, openOpps, overdueTaskCount, upcomingApptCount] =
    await Promise.all([
      query(
        "ghl_opportunities",
        `location_id=eq.${encodeURIComponent(locationId)}&status=not.in.(won,lost)&order=updated_at.desc&limit=20`
      ),
      query(
        "ghl_tasks",
        `location_id=eq.${encodeURIComponent(locationId)}&completed=eq.false&order=due_date.asc&limit=20`
      ),
      query(
        "ghl_appointments",
        `location_id=eq.${encodeURIComponent(locationId)}&start_time=gt.${encodeURIComponent(now)}&order=start_time.asc&limit=20`
      ),
      // Stats: all open opps (for count + value sum)
      query(
        "ghl_opportunities",
        `location_id=eq.${encodeURIComponent(locationId)}&status=not.in.(won,lost)&select=monetary_value`
      ),
      count(
        "ghl_tasks",
        `location_id=eq.${encodeURIComponent(locationId)}&completed=eq.false&due_date=lt.${encodeURIComponent(now)}`
      ),
      count(
        "ghl_appointments",
        `location_id=eq.${encodeURIComponent(locationId)}&start_time=gt.${encodeURIComponent(now)}`
      ),
    ])

  const openValue = (openOpps as { monetary_value: number | null }[]).reduce(
    (sum: number, o) => sum + (o.monetary_value || 0),
    0
  )

  return NextResponse.json({
    opportunities,
    tasks,
    appointments,
    stats: {
      open_opps: openOpps.length,
      open_value: openValue,
      overdue_tasks: overdueTaskCount,
      upcoming_appts: upcomingApptCount,
    },
  })
}
