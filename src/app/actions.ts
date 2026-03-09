"use server"

import { cookies } from "next/headers"

export async function setActiveClient(client: string) {
  const cookieStore = await cookies()
  cookieStore.set("active_client", client, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
}
