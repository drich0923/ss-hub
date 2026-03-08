"use client";

import { APPS, type App } from "@/lib/apps";
import { Users, ClipboardCheck, UserPlus, BookOpen, TrendingUp, BarChart2, Lock, ExternalLink } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{size?: number; color?: string}>> = {
  Users, ClipboardCheck, UserPlus, BookOpen, TrendingUp, BarChart2,
};

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string; btn: string }> = {
  blue:   { bg: "rgba(45,98,255,0.08)",  border: "rgba(45,98,255,0.25)",  icon: "#2d62ff", btn: "#2d62ff" },
  green:  { bg: "rgba(140,235,76,0.08)", border: "rgba(140,235,76,0.25)", icon: "#8ceb4c", btn: "#8ceb4c" },
  purple: { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", icon: "#8b5cf6", btn: "#8b5cf6" },
  orange: { bg: "rgba(255,93,0,0.08)",   border: "rgba(255,93,0,0.25)",   icon: "#ff5d00", btn: "#ff5d00" },
  yellow: { bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.25)",  icon: "#eab308", btn: "#eab308" },
};

interface Props {
  apps: App[];
  permittedSlugs: string[];
  isAdmin: boolean;
  userRole: string;
  userClient: string | null;
}

export default function AppGrid({ apps, permittedSlugs, isAdmin, userRole, userClient }: Props) {
  // Filter apps by role
  const visibleApps = userRole === 'sales_rep'
    ? apps.filter(a => a.audience === 'all' || a.audience === 'sales_rep')
    : userRole === 'client'
    ? apps.filter(a => a.audience === 'all' || a.audience === 'client')
    : apps; // admin/manager see everything
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "20px",
    }}>
      {visibleApps.map((app) => {
        const hasAccess = isAdmin || permittedSlugs.includes(app.slug);
        const isLive = app.status === "live";
        const colors = COLOR_MAP[app.color] ?? COLOR_MAP.blue;
        const Icon = ICON_MAP[app.icon] ?? Users;

        return (
          <div
            key={app.slug}
            style={{
              background: hasAccess ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${hasAccess ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
              borderRadius: "16px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              opacity: hasAccess ? 1 : 0.5,
              transition: "border-color 0.2s, box-shadow 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              if (hasAccess) {
                (e.currentTarget as HTMLDivElement).style.borderColor = colors.border;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${colors.bg}`;
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = hasAccess ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            {/* Top accent line */}
            {hasAccess && (
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "2px",
                background: `linear-gradient(90deg, transparent, ${colors.icon}, transparent)`,
              }} />
            )}

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              {/* Icon */}
              <div style={{
                width: "48px", height: "48px",
                borderRadius: "12px",
                background: hasAccess ? colors.bg : "rgba(255,255,255,0.04)",
                border: `1px solid ${hasAccess ? colors.border : "rgba(255,255,255,0.06)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {hasAccess
                  ? <Icon size={22} color={colors.icon} />
                  : <Lock size={18} color="#555" />
                }
              </div>

              {/* Status badge */}
              {!isLive ? (
                <span style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "#555",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "100px",
                  padding: "3px 10px",
                }}>
                  Coming Soon
                </span>
              ) : (
                <span style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "#8ceb4c",
                  background: "rgba(140,235,76,0.08)",
                  border: "1px solid rgba(140,235,76,0.2)",
                  borderRadius: "100px",
                  padding: "3px 10px",
                }}>
                  Live
                </span>
              )}
            </div>

            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                {app.name}
              </h2>
              <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: 1.5 }}>
                {app.description}
              </p>
            </div>

            {/* Button */}
            {hasAccess && isLive ? (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  background: colors.btn,
                  border: "none",
                  borderRadius: "8px",
                  color: app.color === "green" || app.color === "yellow" ? "#000" : "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  marginTop: "auto",
                  cursor: "pointer",
                }}
              >
                Launch <ExternalLink size={13} />
              </a>
            ) : (
              <div style={{
                padding: "10px 16px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "8px",
                color: "#444",
                fontSize: "13px",
                fontWeight: 600,
                textAlign: "center",
                marginTop: "auto",
              }}>
                {!hasAccess ? "No Access" : "Coming Soon"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
