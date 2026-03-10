import { NextResponse } from "next/server"
import { Pool } from "pg"

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL

const MIGRATION = `
CREATE TABLE IF NOT EXISTS ghl_opportunities (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  contact_id TEXT,
  contact_name TEXT,
  contact_url TEXT,
  pipeline_id TEXT,
  pipeline_stage_id TEXT,
  stage_name TEXT,
  assigned_to TEXT,
  status TEXT,
  monetary_value NUMERIC,
  last_stage_change_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  raw JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ghl_opps_location ON ghl_opportunities(location_id);
CREATE INDEX IF NOT EXISTS idx_ghl_opps_assigned ON ghl_opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ghl_opps_stage ON ghl_opportunities(pipeline_stage_id);
CREATE INDEX IF NOT EXISTS idx_ghl_opps_contact ON ghl_opportunities(contact_id);

CREATE TABLE IF NOT EXISTS ghl_tasks (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  contact_id TEXT,
  contact_name TEXT,
  contact_url TEXT,
  assigned_to TEXT,
  title TEXT,
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  raw JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ghl_tasks_location ON ghl_tasks(location_id);
CREATE INDEX IF NOT EXISTS idx_ghl_tasks_assigned ON ghl_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ghl_tasks_contact ON ghl_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_ghl_tasks_due ON ghl_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_ghl_tasks_completed ON ghl_tasks(completed);

CREATE TABLE IF NOT EXISTS ghl_appointments (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  contact_id TEXT,
  contact_name TEXT,
  contact_url TEXT,
  calendar_id TEXT,
  calendar_name TEXT,
  assigned_user_id TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  title TEXT,
  raw JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ghl_appts_location ON ghl_appointments(location_id);
CREATE INDEX IF NOT EXISTS idx_ghl_appts_assigned ON ghl_appointments(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_ghl_appts_start ON ghl_appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_ghl_appts_contact ON ghl_appointments(contact_id);

CREATE TABLE IF NOT EXISTS ghl_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  location_id TEXT,
  event_type TEXT,
  resource_id TEXT,
  payload JSONB
);
`

export async function POST() {
  if (!SUPABASE_DB_URL) {
    return NextResponse.json({ error: "SUPABASE_DB_URL not set" }, { status: 500 })
  }
  const pool = new Pool({ connectionString: SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } })
  try {
    await pool.query(MIGRATION)
    return NextResponse.json({ ok: true, message: "Migration complete — tables created" })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    await pool.end()
  }
}
