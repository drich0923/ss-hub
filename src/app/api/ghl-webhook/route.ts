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
  if (type.toLowerCase() === "opportunitydelete") {
    await deleteRow("ghl_opportunities", id)
    return
  }
  const cd = (opp.customData ?? {}) as Record<string, unknown>
  const oppId = (cd.id ?? opp.id ?? id) as string
  const contactId = (opp.contact_id ?? opp.contactId) as string | undefined
  const contactName = (opp.full_name ?? nested(opp, "contact", "name") ?? opp.contactName) as string | null ?? null

  await upsert("ghl_opportunities", {
    id: oppId,
    location_id: locationId,
    contact_id: contactId ?? null,
    contact_name: contactName,
    contact_url: buildContactUrl(locationId, contactId),
    pipeline_id: opp.pipelineId as string | null ?? null,
    pipeline_stage_id: opp.pipelineStageId as string | null ?? null,
    stage_name: (cd.stage ?? opp.stageName ?? opp.pipelineStageName) as string | null ?? null,
    assigned_to: (opp.assignedTo ?? (opp.user as Record<string, unknown>)?.email) as string | null ?? null,
    status: opp.status as string | null ?? null,
    monetary_value: opp.monetaryValue as number | null ?? null,
    last_stage_change_at: opp.lastStageChangeAt as string | null ?? null,
    updated_at: opp.updatedAt as string | null ?? null,
    raw: opp,
    synced_at: new Date().toISOString(),
  })
}

async function handleTask(type: string, locationId: string, id: string, task: Record<string, unknown>) {
  const normalizedType = type.toLowerCase()
  if (normalizedType === "taskdelete") {
    await deleteRow("ghl_tasks", id)
    return
  }
  const isCompleted = (normalizedType === "taskcomplete") ? true : (task.isCompleted ?? false)
  const taskContactId = (task.contact_id ?? task.contactId ?? id) as string | undefined
  const taskContactName = (task.full_name ?? nested(task, "contact", "name") ?? task.contactName) as string | null ?? null
  const cd = (task.customData ?? {}) as Record<string, unknown>

  await upsert("ghl_tasks", {
    id: (task.id ?? id) as string,
    location_id: locationId,
    contact_id: taskContactId ?? null,
    contact_name: taskContactName,
    contact_url: buildContactUrl(locationId, taskContactId),
    assigned_to: (task.assignedTo ?? (task.user as Record<string, unknown>)?.email) as string | null ?? null,
    title: (cd.title ?? task.title) as string | null ?? null,
    due_date: (cd.due_date ?? task.dueDate) as string | null ?? null,
    completed: isCompleted,
    completed_at: isCompleted ? (task.completedAt as string ?? new Date().toISOString()) : null,
    updated_at: task.updatedAt as string | null ?? null,
    raw: task,
    synced_at: new Date().toISOString(),
  })
}

async function handleAppointment(type: string, locationId: string, id: string, appt: Record<string, unknown>) {
  if (type === "AppointmentDelete") {
    await deleteRow("ghl_appointments", id)
    return
  }
  // GHL workflow webhooks send contact data, not appointment objects.
  // Extract what's available from the flat contact payload.
  const contactId = (appt.contact_id ?? appt.contactId ?? id) as string | undefined
  const contactName = (appt.full_name ?? nested(appt, "contact", "name") ?? appt.contactName) as string | null ?? null
  const rowId = (appt.id ?? id) as string
  // GHL custom data fields are in appt.customData
  const cd = (appt.customData ?? {}) as Record<string, unknown>

  await upsert("ghl_appointments", {
    id: rowId,
    location_id: locationId,
    contact_id: contactId ?? null,
    contact_name: contactName,
    contact_url: buildContactUrl(locationId, contactId),
    calendar_id: (appt.calendarId ?? cd.calendar_id) as string | null ?? null,
    calendar_name: (appt.calendarName ?? cd.calendar_name) as string | null ?? null,
    assigned_user_id: ((appt.user as Record<string, unknown>)?.email ?? appt.assignedUserId) as string | null ?? null,
    start_time: (cd["start time"] ?? cd.start_time ?? appt.startTime) as string | null ?? null,
    end_time: (cd.end_time ?? appt.endTime) as string | null ?? null,
    status: (cd.status ?? appt.status) as string | null ?? null,
    title: (cd.title ?? appt.title) as string | null ?? null,
    raw: appt,
    synced_at: new Date().toISOString(),
  })
}

async function handlePcnSubmission(locationId: string, body: Record<string, unknown>) {
  // GHL webhook payload for form submissions — PCN fields are at top level of body
  // Field names confirmed from real GHL payload (March 10, 2026)
  const f = (key: string, ...aliases: string[]): unknown => {
    for (const k of [key, ...aliases]) {
      if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k]
    }
    return null
  }

  await upsert("ghl_pcns", {
    location_id: locationId,
    contact_id: body.contact_id ?? body.contactId ?? null,
    contact_email: body.email ?? null,
    contact_phone: body.phone ?? f("Client Phone (copy paste into here)"),
    appointment_id: f("PCN - Appointment ID", "Call Notes - Appointment ID"),
    call_outcome: f("PCN - Call Outcome", "Call Notes - Call Outcome", "Call Outcome"),
    first_call_or_followup: f("PCN - First Call or Follow Up", "Call Notes - First Call or Follow Up", "First Call or Follow Up?"),
    cash_collected: f("PCN - Cash Collected"),
    signed_notes: f("PCN - Signed Notes", "Call Notes - Signed Notes"),
    qualification_status: f("PCN - Qualification Status", "Call Notes - Qualification Status"),
    financial_health_quiz: f("PCN Did They Complete The Financial Health Quiz?", "PCN Did they submit the Financial Health Quiz 2"),
    offer_made: f("PCN - Did you make an offer?", "Call Notes - Did You Make An Offer?"),
    why_didnt_move_forward: f("PCN - Why didn't the prospect move forward", "Call Notes - Why didn't the prospect move forward? v2"),
    call_notes: f("PCN - Not Moving Forward Notes", "Call Notes - Not Moving Forward Notes"),
    followup_scheduled: f("PCN - Was a follow up scheduled?", "Call Notes - Was a Follow Up Scheduled?"),
    expected_close_date: f("PCN - Nurture Type", "Call Notes - Nurture Type"),
    no_show_communicative: f("PCN - Was the no show communicative?", "Call Notes - Was the no show communicative?"),
    dq_reason: f("PCN - DQ Reason", "Call Notes - DQ Reason"),
    dq_notes: f("PCN - DQ Notes", "Call Notes - DQ Notes"),
    cancellation_reason: f("PCN - Cancellation Reason", "Call Notes - Cancellation Reason"),
    cancellation_notes: f("PCN - Cancellation Notes", "Call Notes - Cancellation Notes"),
    submitted_at: new Date().toISOString(),
    raw: body,
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

async function processEvent(body: Record<string, unknown>, type?: string, locationId?: string) {
  const resolvedType = type ?? (body.customData as Record<string, unknown>)?.type as string ?? body.type as string ?? ""
  const resolvedLocationId = locationId ?? body.locationId as string ?? (body.location as Record<string, unknown>)?.id as string ?? ""
  const id = body.id as string ?? body.contact_id as string ?? ""

  if (!resolvedType) return

  const t = resolvedType.toLowerCase()
  if (t.startsWith("opportunity")) {
    const opp = (body.opportunity ?? body) as Record<string, unknown>
    await handleOpportunity(resolvedType, resolvedLocationId, id, opp)
  } else if (t.startsWith("task")) {
    const task = (body.task ?? body) as Record<string, unknown>
    await handleTask(resolvedType, resolvedLocationId, id, task)
  } else if (t.startsWith("appointment")) {
    const appt = (body.appointment ?? body) as Record<string, unknown>
    await handleAppointment(resolvedType, resolvedLocationId, id, appt)
  } else if (t.startsWith("contact")) {
    const contact = (body.contact ?? body) as Record<string, unknown>
    await handleContact(resolvedType, resolvedLocationId, id, contact)
  } else if (t === "formsubmitted" || t === "surveysubmitted") {
    // PCN form submission — fields are at top level of body
    await handlePcnSubmission(resolvedLocationId, body)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // GHL sends type in customData.type (workflow custom data) or body.type
  const type = (body.customData?.type as string) ?? (body.type as string) ?? "unknown"
  // GHL sends locationId as body.locationId or nested body.location.id
  const locationId = (body.locationId as string) ?? (body.location?.id as string) ?? ""
  const id = (body.id as string) ?? (body.contact_id as string) ?? ""

  // Await both — Vercel kills fire-and-forget before writes complete
  await Promise.allSettled([
    logEvent(locationId, type, id, body),
    processEvent(body, type, locationId),
  ])

  return NextResponse.json({ ok: true })
}
