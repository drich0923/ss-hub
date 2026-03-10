import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal,resolution=merge-duplicates",
}

async function upsert(table: string, payload: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`[ghl-webhook] upsert ${table} failed:`, err)
  }
}

async function deleteRow(table: string, id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`[ghl-webhook] delete ${table}/${id} failed:`, err)
  }
}

async function updateContactName(contactId: string, contactName: string) {
  const tables = ["ghl_opportunities", "ghl_tasks", "ghl_appointments"]
  await Promise.all(
    tables.map(async (table) => {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?contact_id=eq.${encodeURIComponent(contactId)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ contact_name: contactName }),
        }
      )
      if (!res.ok) {
        const err = await res.text()
        console.error(`[ghl-webhook] update contact_name on ${table} failed:`, err)
      }
    })
  )
}

async function logEvent(locationId: string, eventType: string, resourceId: string, payload: unknown) {
  await fetch(`${SUPABASE_URL}/rest/v1/ghl_webhook_events`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      location_id: locationId,
      event_type: eventType,
      resource_id: resourceId,
      payload,
    }),
  })
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function nested(obj: Record<string, unknown>, ...keys: string[]): unknown {
  let cur: unknown = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return cur
}

function buildContactUrl(locationId: string, contactId: string | undefined) {
  if (!contactId) return null
  return `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contactId}`
}

async function handleOpportunity(type: string, locationId: string, id: string, opp: Record<string, unknown>) {
  if (type === "OpportunityDelete") {
    await deleteRow("ghl_opportunities", id)
    return
  }
  await upsert("ghl_opportunities", {
    id,
    location_id: locationId,
    contact_id: opp.contactId ?? null,
    contact_name: nested(opp, "contact", "name") ?? opp.contactName ?? null,
    contact_url: buildContactUrl(locationId, opp.contactId as string | undefined),
    pipeline_id: opp.pipelineId ?? null,
    pipeline_stage_id: opp.pipelineStageId ?? null,
    stage_name: opp.stageName ?? opp.pipelineStageName ?? null,
    assigned_to: opp.assignedTo ?? null,
    status: opp.status ?? null,
    monetary_value: opp.monetaryValue ?? null,
    last_stage_change_at: opp.lastStageChangeAt ?? null,
    updated_at: opp.updatedAt ?? null,
    raw: opp,
    synced_at: new Date().toISOString(),
  })
}

async function handleTask(type: string, locationId: string, id: string, task: Record<string, unknown>) {
  if (type === "TaskDelete") {
    await deleteRow("ghl_tasks", id)
    return
  }
  const isCompleted = type === "TaskComplete" ? true : (task.isCompleted ?? false)
  await upsert("ghl_tasks", {
    id,
    location_id: locationId,
    contact_id: task.contactId ?? null,
    contact_name: nested(task, "contact", "name") ?? task.contactName ?? null,
    contact_url: buildContactUrl(locationId, task.contactId as string | undefined),
    assigned_to: task.assignedTo ?? null,
    title: task.title ?? null,
    due_date: task.dueDate ?? null,
    completed: isCompleted,
    completed_at: isCompleted ? (task.completedAt ?? new Date().toISOString()) : null,
    updated_at: task.updatedAt ?? null,
    raw: task,
    synced_at: new Date().toISOString(),
  })
}

async function handleAppointment(type: string, locationId: string, id: string, appt: Record<string, unknown>) {
  if (type === "AppointmentDelete") {
    await deleteRow("ghl_appointments", id)
    return
  }
  await upsert("ghl_appointments", {
    id,
    location_id: locationId,
    contact_id: appt.contactId ?? null,
    contact_name: nested(appt, "contact", "name") ?? appt.contactName ?? null,
    contact_url: buildContactUrl(locationId, appt.contactId as string | undefined),
    calendar_id: appt.calendarId ?? null,
    calendar_name: appt.calendarName ?? null,
    assigned_user_id: appt.assignedUserId ?? null,
    start_time: appt.startTime ?? null,
    end_time: appt.endTime ?? null,
    status: appt.status ?? null,
    title: appt.title ?? null,
    raw: appt,
    synced_at: new Date().toISOString(),
  })
}

async function handleContact(type: string, locationId: string, id: string, contact: Record<string, unknown>) {
  if (type === "ContactDelete") {
    // Clear contact references but don't delete opp/task/appt rows
    return
  }
  // ContactUpdate — update contact_name across all tables
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || (contact.name as string)
  if (name) {
    await updateContactName(id, name)
  }
}

async function processEvent(body: Record<string, unknown>) {
  const type = body.type as string
  const locationId = body.locationId as string
  const id = body.id as string

  if (!type || !id) return

  if (type.startsWith("Opportunity")) {
    const opp = (body.opportunity ?? body) as Record<string, unknown>
    await handleOpportunity(type, locationId, id, opp)
  } else if (type.startsWith("Task")) {
    const task = (body.task ?? body) as Record<string, unknown>
    await handleTask(type, locationId, id, task)
  } else if (type.startsWith("Appointment")) {
    const appt = (body.appointment ?? body) as Record<string, unknown>
    await handleAppointment(type, locationId, id, appt)
  } else if (type.startsWith("Contact")) {
    const contact = (body.contact ?? body) as Record<string, unknown>
    await handleContact(type, locationId, id, contact)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const type = body.type as string ?? "unknown"
  const locationId = body.locationId as string ?? ""
  const id = body.id as string ?? ""

  // Log event and process async — respond immediately
  logEvent(locationId, type, id, body).catch(() => {})
  processEvent(body).catch((err) => console.error("[ghl-webhook] process error:", err))

  return NextResponse.json({ ok: true })
}
