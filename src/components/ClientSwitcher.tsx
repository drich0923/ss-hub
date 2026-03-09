"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { CLIENTS } from "@/lib/apps"
import { setActiveClient } from "@/app/actions"

export default function ClientSwitcher({ activeClient }: { activeClient: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick(client: string) {
    startTransition(async () => {
      await setActiveClient(client)
      router.refresh()
    })
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "12px 24px",
      maxWidth: "1200px",
      margin: "0 auto",
      opacity: isPending ? 0.7 : 1,
      transition: "opacity 0.15s",
    }}>
      <span style={{
        fontSize: "11px",
        color: "#444",
        fontWeight: 600,
        letterSpacing: "1px",
        textTransform: "uppercase",
        marginRight: "4px",
      }}>
        Viewing as:
      </span>
      {CLIENTS.map(client => {
        const isActive = activeClient === client
        return (
          <button
            key={client}
            onClick={() => handleClick(client)}
            style={{
              background: isActive ? "rgba(140,235,76,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${isActive ? "rgba(140,235,76,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "20px",
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#8ceb4c" : "#666",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {client}
          </button>
        )
      })}
    </div>
  )
}
