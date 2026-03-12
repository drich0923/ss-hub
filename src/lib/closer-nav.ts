export type NavItemType = 'page' | 'link' | 'embed' | 'coming_soon' | 'section' | 'special'

export interface NavItem {
  key: string
  label: string
  type: NavItemType
  children?: NavItem[]
}

export const CLOSER_NAV: NavItem[] = [
  { key: "starred", label: "Starred", type: "special" },
  { key: "how-to-use", label: "How To Use This Dashboard", type: "page" },
  { key: "payment-links", label: "Payment Links", type: "page" },
  { key: "student-success-stories", label: "Student Success Stories", type: "link" },
  { key: "playbook", label: "Playbooks", type: "section", children: [

    { key: "playbook/sales-calls", label: "Sales Calls", type: "section", children: [
      { key: "playbook/sales-calls/pre-call", label: "Pre Call", type: "section", children: [] },
      { key: "playbook/sales-calls/during-call", label: "During Call", type: "section", children: [
        { key: "playbook/sales-calls/during-call/master-script", label: "Master Script", type: "page" },
      ]},
      { key: "playbook/sales-calls/post-call", label: "Post Call", type: "section", children: [
        { key: "playbook/sales-calls/post-call/white-space-sop", label: "White Space SOP", type: "coming_soon" },
      ]},
      { key: "playbook/sales-calls/payment-agreement", label: "Payment Agreement", type: "section", children: [
        { key: "playbook/sales-calls/payment-agreement/manually-sending-contracts", label: "Manually Sending Contracts", type: "embed" },
        { key: "playbook/sales-calls/payment-agreement/payment-links", label: "Payment Links", type: "page" },
        { key: "playbook/sales-calls/payment-agreement/klarna-verification-sop", label: "Klarna Verification SOP", type: "page" },
        { key: "playbook/sales-calls/payment-agreement/create-and-use-invoice", label: "Create and Use Invoice", type: "link" },
        { key: "playbook/sales-calls/payment-agreement/bda-refund-sop", label: "BDA Refund SOP", type: "link" },
        { key: "playbook/sales-calls/payment-agreement/refund-request", label: "Refund Request", type: "page" },
        { key: "playbook/sales-calls/payment-agreement/cash-refund-tracker", label: "Cash & Refund Tracker", type: "link" },
        { key: "playbook/sales-calls/payment-agreement/manually-charge-upsell", label: "Manually Charge Customer (Upsell)", type: "link" },
      ]},
      { key: "playbook/sales-calls/onboarding", label: "Onboarding", type: "section", children: [
        { key: "playbook/sales-calls/onboarding/contract-onboarding", label: "Contract Onboarding", type: "page" },
        { key: "playbook/sales-calls/onboarding/cancellation-refund", label: "Cancellation/Refund Requests", type: "link" },
      ]},
    ]},

    { key: "playbook/admin", label: "Admin", type: "section", children: [
      { key: "playbook/admin/expectations", label: "Expectations", type: "section", children: [
        { key: "playbook/admin/expectations/the-way", label: "The Budgetdog Way", type: "page" },
        { key: "playbook/admin/expectations/the-standard", label: "The Budgetdog Standard", type: "page" },
        { key: "playbook/admin/expectations/scorecard", label: "Scorecard", type: "link" },
      ]},
      { key: "playbook/admin/daily-weekly-monthly", label: "Daily/Weekly/Monthly", type: "section", children: [
        { key: "playbook/admin/daily-weekly-monthly/daily", label: "Daily", type: "section", children: [
          { key: "playbook/admin/daily-weekly-monthly/daily/checklist", label: "Closer Daily Checklist", type: "page" },
          { key: "playbook/admin/daily-weekly-monthly/daily/ghl-lead-follow-up", label: "GHL Lead Follow Up Process", type: "page" },
        ]},
        { key: "playbook/admin/daily-weekly-monthly/weekly", label: "Weekly", type: "section", children: [] },
        { key: "playbook/admin/daily-weekly-monthly/monthly", label: "Monthly", type: "section", children: [
          { key: "playbook/admin/daily-weekly-monthly/monthly/eom-reoffer-sop", label: "EOM Re-Offer SOP", type: "page" },
        ]},
      ]},
      { key: "playbook/admin/internal-comms", label: "Internal Communications", type: "section", children: [
        { key: "playbook/admin/internal-comms/slack-channels", label: "How to Use Slack Channels", type: "embed" },
        { key: "playbook/admin/internal-comms/sales-team-meetings", label: "Sales Team Meetings", type: "link" },
      ]},
      { key: "playbook/admin/hr", label: "Other HR Items", type: "section", children: [
        { key: "playbook/admin/hr/time-off", label: "Time Off Request", type: "link" },
        { key: "playbook/admin/hr/team-calendar", label: "Team Event Calendar", type: "link" },
        { key: "playbook/admin/hr/comp-plan", label: "Sales Comp Plan 2026", type: "page" },
        { key: "playbook/admin/hr/google-authenticator", label: "Google Authenticator SOP", type: "page" },
      ]},
    ]},

    { key: "playbook/tech", label: "Tech", type: "section", children: [
      { key: "playbook/tech/tech-stack", label: "Tech Stack Overview", type: "section", children: [
        { key: "playbook/tech/tech-stack/slack", label: "Slack (Internal Communication)", type: "coming_soon" },
        { key: "playbook/tech/tech-stack/task-management", label: "Task Management (Asana/ClickUp)", type: "coming_soon" },
      ]},
      { key: "playbook/tech/calendars", label: "Calendars", type: "section", children: [
        { key: "playbook/tech/calendars/calendars-link", label: "Calendars", type: "link" },
      ]},
      { key: "playbook/tech/crm", label: "CRM Training", type: "section", children: [
        { key: "playbook/tech/crm/ghl-overview", label: "Overview of GHL Sales Meeting", type: "link" },
        { key: "playbook/tech/crm/ghl-training", label: "GHL Sales Rep Training", type: "link" },
        { key: "playbook/tech/crm/calendars", label: "Calendars", type: "link" },
      ]},
      { key: "playbook/tech/pcn", label: "PCN", type: "section", children: [
        { key: "playbook/tech/pcn/how-to-create", label: "How To Create a PCN Link", type: "embed" },
        { key: "playbook/tech/pcn/meeting-transfers", label: "SOP: Meeting Transfers", type: "page" },
      ]},
    ]},

    { key: "playbook/training", label: "Training", type: "section", children: [
      { key: "playbook/training/understanding-leads", label: "Understanding Your Leads", type: "section", children: [
        { key: "playbook/training/understanding-leads/icp", label: "Offer ICP Training", type: "section", children: [
          { key: "playbook/training/understanding-leads/icp/pattern-recognition", label: "ICP Pattern Recognition", type: "page" },
          { key: "playbook/training/understanding-leads/icp/ideal-customer-profile", label: "Ideal Customer Profile", type: "page" },
          { key: "playbook/training/understanding-leads/icp/low-ticket", label: "Low Ticket (Millionaire Club)", type: "link" },
          { key: "playbook/training/understanding-leads/icp/handling-competitors", label: "Handling Competitors", type: "page" },
          { key: "playbook/training/understanding-leads/icp/private-investment-upsell", label: "Private Investment Upsell", type: "link" },
        ]},
        { key: "playbook/training/understanding-leads/company-info", label: "Company & Owner Info", type: "section", children: [
          { key: "playbook/training/understanding-leads/company-info/understanding-academy", label: "Understanding the Academy", type: "link" },
          { key: "playbook/training/understanding-leads/company-info/services", label: "Services", type: "link" },
          { key: "playbook/training/understanding-leads/company-info/founder-journey", label: "Founder Hero Journey", type: "coming_soon" },
        ]},
        { key: "playbook/training/understanding-leads/offer", label: "Offer/Marketing/Application", type: "section", children: [
          { key: "playbook/training/understanding-leads/offer/other-offers", label: "Understanding Other Offers", type: "link" },
          { key: "playbook/training/understanding-leads/offer/funnel", label: "Funnel", type: "link" },
        ]},
        { key: "playbook/training/understanding-leads/sales-training", label: "Sales Training", type: "section", children: [
          { key: "playbook/training/understanding-leads/sales-training/call-vault", label: "Closer Call Vault", type: "link" },
          { key: "playbook/training/understanding-leads/sales-training/identify-issue", label: "Identifying What to Train", type: "coming_soon" },
          { key: "playbook/training/understanding-leads/sales-training/decision-tree", label: "FOR CLOSERS: Decision Tree (Objection Handling)", type: "coming_soon" },
          { key: "playbook/training/understanding-leads/sales-training/identify-the-issue", label: "How to Identify the Issue", type: "coming_soon" },
          { key: "playbook/training/understanding-leads/sales-training/how-to-practice", label: "How to Practice", type: "coming_soon" },
          { key: "playbook/training/understanding-leads/sales-training/move-on", label: "Move On from Training", type: "coming_soon" },
          { key: "playbook/training/understanding-leads/sales-training/training-vault", label: "Training Vault", type: "coming_soon" },
        ]},
      ]},
      { key: "playbook/training/sales-calls-trainings", label: "Sales Calls Trainings", type: "coming_soon" },
    ]},

    { key: "playbook/resources", label: "Resources & Assets", type: "section", children: [
      { key: "playbook/resources/pricing-calculator", label: "Pricing Calculator", type: "page" },
      { key: "playbook/resources/marketing", label: "Marketing Assets", type: "section", children: [
        { key: "playbook/resources/marketing/podcast", label: "Podcast Link", type: "link" },
        { key: "playbook/resources/marketing/youtube", label: "YouTube", type: "link" },
        { key: "playbook/resources/marketing/one-pager", label: "Private Investment One Pager", type: "link" },
        { key: "playbook/resources/marketing/skool-referral", label: "Partner Referral Links (Skool)", type: "link" },
        { key: "playbook/resources/marketing/financial-tools", label: "Financial Resource/Tools Links", type: "link" },
        { key: "playbook/resources/marketing/financial-quiz", label: "Financial Quiz", type: "link" },
      ]},
      { key: "playbook/resources/testimonials", label: "Testimonials & Success Stories", type: "section", children: [
        { key: "playbook/resources/testimonials/student-wins", label: "Student Wins", type: "link" },
        { key: "playbook/resources/testimonials/academy-stats", label: "Academy Stats", type: "link" },
        { key: "playbook/resources/testimonials/success-files", label: "Downloadable Success Files", type: "link" },
        { key: "playbook/resources/testimonials/youtube", label: "YouTube Testimonials", type: "link" },
        { key: "playbook/resources/testimonials/trustpilot", label: "Trustpilot", type: "link" },
      ]},
      { key: "playbook/resources/referral", label: "Referral Process", type: "section", children: [
        { key: "playbook/resources/referral/referral-link", label: "Academy Referral Link", type: "link" },
      ]},
    ]},

  ]},
]

export function flattenNav(items: NavItem[]): NavItem[] {
  const result: NavItem[] = []
  for (const item of items) {
    if (item.type !== 'section' && item.type !== 'special') {
      result.push(item)
    }
    if (item.children) {
      result.push(...flattenNav(item.children))
    }
  }
  return result
}

export function findNavItem(items: NavItem[], key: string): NavItem | null {
  for (const item of items) {
    if (item.key === key) return item
    if (item.children) {
      const found = findNavItem(item.children, key)
      if (found) return found
    }
  }
  return null
}
