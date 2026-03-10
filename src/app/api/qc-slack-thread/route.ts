import { NextRequest, NextResponse } from "next/server"
import fs from "fs"

async function getSlackToken(): Promise<string | null> {
  if (process.env.SLACK_BOT_TOKEN) return process.env.SLACK_BOT_TOKEN
  try {
    const config = JSON.parse(fs.readFileSync("/Users/clawdbot/.openclaw/openclaw.json", "utf-8"))
    return config.channels?.slack?.accounts?.charlie?.botToken ?? null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const channel = req.nextUrl.searchParams.get("slack_channel")
  const ts = req.nextUrl.searchParams.get("slack_ts")

  if (!channel || !ts) {
    return NextResponse.json({ error: "Missing slack_channel or slack_ts" }, { status: 400 })
  }

  const token = await getSlackToken()
  if (!token) {
    return NextResponse.json({ error: "Slack token not configured" }, { status: 500 })
  }

  const url = `https://slack.com/api/conversations.replies?channel=${encodeURIComponent(channel)}&ts=${encodeURIComponent(ts)}&limit=50`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()

  if (!data.ok) {
    return NextResponse.json({ error: data.error ?? "Slack API error" }, { status: 502 })
  }

  const messages = data.messages ?? []
  // Convert Slack mrkdwn links <url|name> → name (url is in the GHL app)
  // Since pasting into Slack DM doesn't render mrkdwn, keep the display name + strip raw URL
  function convertMrkdwn(text: string): string {
    return text.replace(/<(https?:[^|>]+)\|([^>]+)>/g, (_, url, name) => `${name}\n   • ${url}`)
  }
  const threadText = messages.slice(1).map((m: { text: string }) => convertMrkdwn(m.text)).join('\n\n')

  return NextResponse.json({ text: threadText })
}
