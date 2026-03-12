import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerToken = session.provider_token;
  if (!providerToken) {
    return NextResponse.json({ error: "no_calendar", message: "Google Calendar not connected. Please sign out and sign back in to grant calendar access." }, { status: 200 });
  }

  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    const calendarUrl = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    calendarUrl.searchParams.set("timeMin", startOfWeek.toISOString());
    calendarUrl.searchParams.set("timeMax", endOfWeek.toISOString());
    calendarUrl.searchParams.set("singleEvents", "true");
    calendarUrl.searchParams.set("orderBy", "startTime");
    calendarUrl.searchParams.set("maxResults", "50");

    const res = await fetch(calendarUrl.toString(), {
      headers: { Authorization: `Bearer ${providerToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) {
        return NextResponse.json({ error: "token_expired", message: "Calendar token expired. Please sign out and sign back in." }, { status: 200 });
      }
      return NextResponse.json({ error: "calendar_error", message: err.error?.message || "Failed to fetch calendar" }, { status: 200 });
    }

    const data = await res.json();
    const extractMeetLink = (e: any) => {
      // Check conference data first (Google Meet)
      if (e.conferenceData?.entryPoints) {
        const video = e.conferenceData.entryPoints.find((ep: any) => ep.entryPointType === "video");
        if (video?.uri) return video.uri;
      }
      if (e.hangoutLink) return e.hangoutLink;
      // Check location for Zoom/Meet URLs
      const urlPattern = /(https?:\/\/[^\s]*(?:zoom\.us|meet\.google\.com|teams\.microsoft\.com)[^\s]*)/i;
      if (e.location) { const m = e.location.match(urlPattern); if (m) return m[1]; }
      if (e.description) { const m = e.description.match(urlPattern); if (m) return m[1]; }
      return null;
    };

    const events = (data.items || []).map((e: any) => {
      const meetLink = extractMeetLink(e);
      // Clean location: remove URL if it's the only content
      let location = e.location || "";
      if (meetLink && location) {
        const cleaned = location.replace(/(https?:\/\/[^\s]+)/g, "").trim();
        location = cleaned || "";
      }
      return {
        id: e.id,
        title: e.summary || "(No title)",
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        location: location || null,
        meetLink,
        allDay: !!e.start?.date,
      };
    });

    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json({ error: "fetch_failed", message: String(err) }, { status: 500 });
  }
}
