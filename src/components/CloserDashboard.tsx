"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CLOSER_NAV, flattenNav, findNavItem, type NavItem } from "@/lib/closer-nav";
import CloserEditor from "@/components/CloserEditor";
import { Star, ChevronRight, ChevronDown, Search, ExternalLink, Clock, ArrowLeft, Menu, X, BookOpen, DollarSign, FileText, CheckSquare, Briefcase, GraduationCap, FolderOpen, Calendar, Phone, ClipboardList, CreditCard, UserCheck, Settings, MessageSquare, Users, Monitor, Dumbbell, BarChart2, Gift, Link as LinkIcon, LucideIcon } from "lucide-react";

// Nav item icons
const NAV_ICONS: Record<string, LucideIcon> = {
  "playbook/sales-calls": Phone,
  "playbook/sales-calls/pre-call": Clock,
  "playbook/sales-calls/during-call": Phone,
  "playbook/sales-calls/post-call": CheckSquare,
  "playbook/sales-calls/payment-agreement": CreditCard,
  "playbook/sales-calls/onboarding": UserCheck,
  "playbook/admin": Settings,
  "playbook/admin/expectations": Star,
  "playbook/admin/daily-weekly-monthly": Calendar,
  "playbook/admin/internal-comms": MessageSquare,
  "playbook/admin/hr": Users,
  "playbook/tech": Monitor,
  "playbook/tech/calendars": Calendar,
  "playbook/tech/crm": Settings,
  "playbook/tech/pcn": ClipboardList,
  "playbook/training": GraduationCap,
  "playbook/training/understanding-leads": Dumbbell,
  "playbook/training/sales-calls-trainings": Phone,
  "playbook/resources": Gift,
  "playbook/resources/pricing-calculator": BarChart2,
  "playbook/resources/marketing": ExternalLink,
  "playbook/resources/testimonials": Star,
  "playbook/resources/referral": LinkIcon,
};



interface CloserPage {
  id: string;
  client_slug: string;
  nav_key: string;
  title: string;
  content: Record<string, unknown>;
  page_type: string;
  external_url: string | null;
  loom_url: string | null;
  position: number;
}

interface Props {
  clientSlug: string;
  pages: CloserPage[];
  bookmarks: string[];
  role: string;
  isAdmin: boolean;
  userId: string;
  activeSlug: string | null;
}

function extractLoomId(url: string): string | null {
  const m = url.match(/loom\.com\/share\/([a-f0-9]+)/);
  return m ? m[1] : null;
}

function CalendarWidget({ events, loading, error }: { events: any[]; loading: boolean; error: string | null }) {
  const [view, setView] = useState<"today" | "tomorrow" | "3day" | "week">("3day");
  
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const day3 = new Date(today); day3.setDate(today.getDate() + 3);
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + (7 - today.getDay()));
    
    let start = today, end = tomorrow;
    if (view === "tomorrow") { start = tomorrow; end = new Date(tomorrow); end.setDate(end.getDate() + 1); }
    else if (view === "3day") { start = today; end = day3; }
    else if (view === "week") { start = today; end = weekEnd; }
    
    return events.filter(e => {
      const d = new Date(e.start);
      return d >= start && d < end;
    });
  }, [events, view]);

  // Group by day
  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredEvents.forEach(evt => {
      const d = new Date(evt.start);
      const key = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(evt);
    });
    return groups;
  }, [filteredEvents]);

  const tabs = [
    { key: "today" as const, label: "Today" },
    { key: "tomorrow" as const, label: "Tomorrow" },
    { key: "3day" as const, label: "3 Day" },
    { key: "week" as const, label: "This Week" },
  ];

  return (
    <div style={{ marginBottom: "52px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444" }}>📅 Schedule</div>
        <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "3px", border: "1px solid rgba(255,255,255,0.06)" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setView(t.key)} style={{
              padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
              fontSize: "11px", fontWeight: 600, transition: "all 0.15s",
              background: view === t.key ? "rgba(45,98,255,0.15)" : "transparent",
              color: view === t.key ? "#5b8aff" : "#555",
            }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "24px" }}>
        {loading ? (
          <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Loading calendar...</p>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Calendar size={32} color="#444" style={{ marginBottom: 8 }} />
            <p style={{ color: "#555", fontSize: "13px", margin: "0 0 8px" }}>{error}</p>
            <p style={{ color: "#444", fontSize: "11px", margin: 0 }}>Sign out and back in to connect your Google Calendar</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>No events for this period</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Object.keys(grouped).length}, 1fr)`, gap: "12px", minHeight: "200px" }}>
            {Object.entries(grouped).map(([day, dayEvents]) => {
              const isToday = new Date(dayEvents[0].start).toDateString() === new Date().toDateString();
              const d = new Date(dayEvents[0].start);
              const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = d.getDate();
              const monthName = d.toLocaleDateString("en-US", { month: "short" });
              return (
                <div key={day} style={{ display: "flex", flexDirection: "column" }}>
                  {/* Day header */}
                  <div style={{
                    textAlign: "center", padding: "12px 8px", marginBottom: "8px",
                    borderRadius: "10px",
                    background: isToday ? "rgba(45,98,255,0.1)" : "transparent",
                    border: isToday ? "1px solid rgba(45,98,255,0.2)" : "1px solid transparent",
                  }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: isToday ? "#5b8aff" : "#555", textTransform: "uppercase", letterSpacing: "1px" }}>{dayName}</div>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: isToday ? "#fff" : "#888", margin: "2px 0" }}>{dayNum}</div>
                    <div style={{ fontSize: "10px", color: "#555" }}>{monthName}</div>
                  </div>
                  {/* Events */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                    {dayEvents.map((evt: any) => {
                      const start = new Date(evt.start);
                      const timeLabel = evt.allDay ? "All day" : start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                      return (
                        <div key={evt.id} style={{
                          padding: "10px",
                          borderRadius: "8px",
                          background: isToday ? "rgba(45,98,255,0.06)" : "rgba(255,255,255,0.03)",
                          border: isToday ? "1px solid rgba(45,98,255,0.12)" : "1px solid rgba(255,255,255,0.05)",
                          cursor: evt.meetLink ? "pointer" : "default",
                        }}
                        onClick={() => evt.meetLink && window.open(evt.meetLink, "_blank")}
                        >
                          <div style={{ fontSize: "10px", color: isToday ? "#5b8aff" : "#666", fontWeight: 600, marginBottom: "4px" }}>{timeLabel}</div>
                          <div style={{ fontSize: "12px", fontWeight: 500, color: "#fff", lineHeight: 1.3 }}>{evt.title}</div>
                          {evt.location && <div style={{ fontSize: "10px", color: "#555", marginTop: 3 }}>{evt.location}</div>}
                          {evt.meetLink && <div style={{ fontSize: "10px", color: "#8ceb4c", marginTop: 4, fontWeight: 600 }}>Join →</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CloserDashboard({ clientSlug, pages, bookmarks: initialBookmarks, role, isAdmin, userId, activeSlug }: Props) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<string[]>(initialBookmarks);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calView, setCalView] = useState<"today" | "tomorrow" | "3day" | "week">("3day");

  useEffect(() => {
    fetch("/api/closer/calendar")
      .then(r => r.json())
      .then(data => {
        if (data.events) setCalendarEvents(data.events);
        else if (data.error) setCalendarError(data.message || "Calendar not connected");
        setCalendarLoading(false);
      })
      .catch(() => { setCalendarError("Failed to load calendar"); setCalendarLoading(false); });
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const expanded: Record<string, boolean> = {};
    if (activeSlug) {
      const parts = activeSlug.split("/");
      let path = "";
      for (const part of parts) {
        path = path ? `${path}/${part}` : part;
        expanded[path] = true;
      }
    }
    expanded["playbook"] = true;
    return expanded;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pageMap = useMemo(() => {
    const map: Record<string, CloserPage> = {};
    for (const p of pages) map[p.nav_key] = p;
    return map;
  }, [pages]);

  const flatItems = useMemo(() => flattenNav(CLOSER_NAV), []);
  const activeNav = activeSlug ? findNavItem(CLOSER_NAV, activeSlug) : null;
  const activePage = activeSlug ? pageMap[activeSlug] : null;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return flatItems.filter(item => {
      const page = pageMap[item.key];
      const titleMatch = item.label.toLowerCase().includes(q);
      const contentMatch = page?.content ? JSON.stringify(page.content).toLowerCase().includes(q) : false;
      return titleMatch || contentMatch;
    });
  }, [searchQuery, flatItems, pageMap]);

  const bookmarkedItems = useMemo(() => {
    return bookmarks.map(key => findNavItem(CLOSER_NAV, key)).filter(Boolean) as NavItem[];
  }, [bookmarks]);

  const toggleBookmark = useCallback(async (navKey: string) => {
    const isBookmarked = bookmarks.includes(navKey);
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(k => k !== navKey));
      await fetch("/api/closer/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_slug: clientSlug, nav_key: navKey }),
      });
    } else {
      setBookmarks(prev => [...prev, navKey]);
      await fetch("/api/closer/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_slug: clientSlug, nav_key: navKey }),
      });
    }
  }, [bookmarks, clientSlug]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navigateTo = (key: string) => {
    window.location.href = `/closer-dashboard/${clientSlug}/${key}`;
  };

  const handleSave = async (content: Record<string, unknown>) => {
    if (!activeSlug || !activeNav) return;
    const existing = pageMap[activeSlug];
    if (existing) {
      await fetch(`/api/closer/pages/${existing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } else {
      await fetch("/api/closer/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_slug: clientSlug,
          nav_key: activeSlug,
          title: activeNav.label,
          content,
          page_type: activeNav.type,
        }),
      });
    }
    router.refresh();
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isSection = item.type === "section";
    const isSpecial = item.type === "special";
    const isExpanded = expandedSections[item.key];
    const isActive = activeSlug === item.key;
    const isBookmarked = bookmarks.includes(item.key);
    const isComingSoon = item.type === "coming_soon";

    if (isSpecial) return null;

    return (
      <div key={item.key}>
        <div
          onClick={() => {
            if (isSection) {
              toggleSection(item.key);
            } else if (!isComingSoon) {
              navigateTo(item.key);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 8px",
            paddingLeft: 8 + depth * 16,
            borderRadius: 6,
            cursor: isComingSoon ? "default" : "pointer",
            background: isActive ? "rgba(140,235,76,0.12)" : "transparent",
            color: isComingSoon ? "#555" : isActive ? "#8ceb4c" : "#ccc",
            fontSize: 13,
            fontWeight: isSection ? 600 : 400,
            transition: "background 0.15s",
            opacity: isComingSoon ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { if (!isActive && !isComingSoon) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
          onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = isActive ? "rgba(140,235,76,0.12)" : "transparent"; }}
        >
          {isSection && (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
          {NAV_ICONS[item.key] && (() => { const Icon = NAV_ICONS[item.key]; return <Icon size={14} style={{ flexShrink: 0, opacity: 0.8 }} />; })()}
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.label}
          </span>
          {isComingSoon && (
            <span style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, color: "#666" }}>Soon</span>
          )}
          {!isSection && !isComingSoon && (
            <Star
              size={13}
              fill={isBookmarked ? "#8ceb4c" : "none"}
              color={isBookmarked ? "#8ceb4c" : "#444"}
              onClick={(e) => { e.stopPropagation(); toggleBookmark(item.key); }}
              style={{ cursor: "pointer", flexShrink: 0 }}
            />
          )}
        </div>
        {isSection && isExpanded && item.children && (
          <div>{item.children.map(child => renderNavItem(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (searchQuery.trim()) {
      return (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: "#fff" }}>
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length === 0 && (
            <p style={{ color: "#666" }}>No results found for &quot;{searchQuery}&quot;</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {searchResults.map(item => (
              <div
                key={item.key}
                onClick={() => { setSearchQuery(""); navigateTo(item.key); }}
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              >
                <div style={{ fontWeight: 500, color: "#fff", fontSize: 14 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{item.key}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!activeSlug) {
      const clientDisplay = clientSlug.charAt(0).toUpperCase() + clientSlug.slice(1);
      const quickAccessItems = [
        { key: "how-to-use", label: "How To Use", desc: "Getting started with the dashboard", icon: BookOpen, color: "#2d62ff" },
        { key: "payment-links", label: "Payment Links", desc: "Client payment links & invoicing", icon: DollarSign, color: "#8ceb4c" },
        { key: "playbook/sales-calls/during-call/master-script", label: "Master Script", desc: "Your go-to closing script", icon: FileText, color: "#a78bfa" },
        { key: "playbook/daily-weekly-monthly/daily-checklist", label: "Daily Checklist", desc: "Stay on track every day", icon: CheckSquare, color: "#ff5d00" },
      ];


      return (
        <div>
          {/* Hero */}
          <div style={{ position: "relative", overflow: "hidden", padding: "64px 32px 56px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(45,98,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(140,235,76,0.08)", border: "1px solid rgba(140,235,76,0.2)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8ceb4c" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#8ceb4c", letterSpacing: "0.5px" }}>{clientDisplay}</span>
              </div>
              <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px", color: "#fff" }}>
                Closer Dashboard
              </h1>
              <p style={{ fontSize: "16px", color: "#666", margin: "0 0 8px" }}>
                Your one-stop command center for SOPs, playbooks, and resources.
              </p>
              <p style={{ fontSize: "13px", color: "#444", margin: 0 }}>
                Everything you need to close &mdash; scripts, training, and tools in one place.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 32px" }}>
            {/* Starred */}
            {bookmarkedItems.length > 0 && (
              <div style={{ marginBottom: "52px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>⭐ Starred Pages</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                  {bookmarkedItems.map(item => {
                    const page = pageMap[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => navigateTo(item.key)}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(140,235,76,0.15)",
                          borderRadius: "14px",
                          padding: "20px",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(140,235,76,0.06)"; e.currentTarget.style.borderColor = "rgba(140,235,76,0.3)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(140,235,76,0.15)"; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <Star size={18} fill="#8ceb4c" color="#8ceb4c" />
                          <span style={{ fontSize: "10px", color: "#555", background: "rgba(255,255,255,0.06)", borderRadius: "4px", padding: "2px 6px", fontWeight: 600 }}>
                            {page?.page_type === "link" ? "LINK" : page?.page_type === "embed" ? "VIDEO" : "PAGE"}
                          </span>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>{item.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Access */}
            <div style={{ marginBottom: "52px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>⚡ Quick Access</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                {quickAccessItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      onClick={() => navigateTo(item.key)}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${item.color}30`,
                        borderRadius: "14px",
                        padding: "20px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${item.color}10`; e.currentTarget.style.borderColor = `${item.color}50`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = `${item.color}30`; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={18} color={item.color} />
                        </div>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>{item.label}</div>
                      <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar */}
            <CalendarWidget events={calendarEvents} loading={calendarLoading} error={calendarError} />

            {/* PCN Tracking */}
            <div style={{ marginBottom: "52px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#444", marginBottom: "16px" }}>📊 PCN Tracking</div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", overflow: "hidden" }}>
                <iframe
                  src="https://docs.google.com/spreadsheets/d/1LwP5gYv93JQPaw65f_kNxjnOF_TyUXB0_AUTQEWkkMk/edit?pli=1&gid=654884524#gid=654884524"
                  style={{ width: "100%", height: "500px", border: "none" }}
                  title="PCN Tracking"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!activeNav) {
      return <p style={{ color: "#666" }}>Page not found in navigation.</p>;
    }

    const pageType = activePage?.page_type || activeNav.type;

    if (pageType === "coming_soon") {
      return (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <Clock size={48} color="#555" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{activeNav.label}</h2>
          <p style={{ color: "#666" }}>This page is coming soon.</p>
        </div>
      );
    }

    if (pageType === "link") {
      const url = activePage?.external_url || "";
      return (
        <div style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", marginBottom: 16 }}>{activePage?.title || activeNav.label}</h2>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 8,
                color: "#b794f6",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 14,
                transition: "all 0.15s",
              }}
            >
              <ExternalLink size={16} /> Open Resource
            </a>
          )}
          {!url && <p style={{ color: "#666" }}>No URL configured for this page yet.</p>}
        </div>
      );
    }

    if (pageType === "embed") {
      const loomUrl = activePage?.loom_url || "";
      const loomId = loomUrl ? extractLoomId(loomUrl) : null;
      return (
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", marginBottom: 16 }}>{activePage?.title || activeNav.label}</h2>
          {loomId ? (
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden" }}>
              <iframe
                src={`https://www.loom.com/embed/${loomId}`}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                allowFullScreen
              />
            </div>
          ) : loomUrl ? (
            <a href={loomUrl} target="_blank" rel="noreferrer" style={{ color: "#8ceb4c", textDecoration: "underline" }}>Watch on Loom →</a>
          ) : (
            <p style={{ color: "#666", fontSize: 12 }}>No video configured. (nav_key: {activeSlug}, page: {activePage ? "yes" : "no"}, loom: {String(activePage?.loom_url)})</p>
          )}
        </div>
      );
    }

    // page type
    return (
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", marginBottom: 16 }}>{activePage?.title || activeNav.label}</h2>
        {activePage?.external_url && (
          <div style={{ marginBottom: 24, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            <iframe
              src={activePage.external_url}
              style={{ width: "100%", height: "600px", border: "none" }}
              title={activePage.title || activeNav.label}
              allow="autoplay"
            />
          </div>
        )}
        <CloserEditor
          content={activePage?.content || {}}
          editable={isAdmin}
          onSave={handleSave}
        />
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050508" }}>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 50,
          display: "none",
          padding: 8,
          borderRadius: 8,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          cursor: "pointer",
        }}
        className="closer-mobile-menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        style={{
          width: 280,
          minWidth: 280,
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.015)",
          display: sidebarOpen ? "flex" : "none",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        {/* Logo / Header */}
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <a href="/" style={{ textDecoration: "none", color: "#666", fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <ArrowLeft size={12} /> Back to Hub
          </a>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Closer Dashboard</h2>
          <p style={{ fontSize: 12, color: "#555", margin: "4px 0 0" }}>{clientSlug}</p>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 12px 8px" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#555" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px 8px 32px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Nav tree */}
        <nav style={{ flex: 1, padding: "4px 8px 20px", overflowY: "auto" }}>
          {CLOSER_NAV.map(item => renderNavItem(item, 0))}
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, padding: activeSlug ? "32px 40px" : 0, maxWidth: activeSlug ? 900 : "none" }}>
        {activeSlug && (
          <button
            onClick={() => router.push(`/closer-dashboard/${clientSlug}`)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 0",
              marginBottom: 16,
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
        )}
        {renderContent()}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .closer-mobile-menu { display: block !important; }
        }
      `}</style>
    </div>
  );
}
