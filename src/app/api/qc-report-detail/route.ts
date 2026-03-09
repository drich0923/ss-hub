import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get("report_id")
  if (!reportId) return NextResponse.json({ error: "report_id required" }, { status: 400 })

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  }

  const [apptRes, issueRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/qc_appointments?report_id=eq.${reportId}&order=appt_time.asc`, { headers, cache: "no-store" }),
    fetch(`${SUPABASE_URL}/rest/v1/qc_pipeline_issues?report_id=eq.${reportId}&order=issue_type.asc,days_stale.desc`, { headers, cache: "no-store" }),
  ])

  const appointments = apptRes.ok ? await apptRes.json() : []
  const pipeline_issues = issueRes.ok ? await issueRes.json() : []

  return NextResponse.json({ appointments, pipeline_issues })
}
