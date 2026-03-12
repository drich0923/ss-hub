export type AppStatus = 'live' | 'coming-soon'
export type AppAudience = 'internal' | 'sales_rep' | 'client' | 'all'

export interface App {
  slug: string
  name: string
  description: string
  url: string
  icon: string
  color: string
  status: AppStatus
  audience: AppAudience  // who can see this app
}

export const CLIENTS = [
  'Budgetdog',
  'BD Tax',
  'Goshen',
  'Intro.com',
  'Full Time Purpose',
  'Simple Programmer',
  'Woobie',
  'Munera Capital',
  'Morrow Marriage',
]

export const APPS: App[] = [
  {
    slug: 'candidate-app',
    name: 'Hiring Dashboard',
    description: 'Review and manage sales rep applicants',
    url: 'https://hiring.systemizedsales.com',
    icon: 'Users',
    color: 'blue',
    status: 'live',
    audience: 'internal',
  },
  {
    slug: 'qc-dashboard',
    name: 'GHL QC Dashboard',
    description: 'Rep performance, SOP compliance, and pipeline hygiene across all clients',
    url: '/qc-dashboard',
    icon: 'ClipboardCheck',
    color: 'green',
    status: 'live',
    audience: 'internal',
  },
  {
    slug: 'rep-onboarding',
    name: 'New Rep Onboarding',
    description: 'Onboarding portal for new sales reps',
    url: '#',
    icon: 'UserPlus',
    color: 'purple',
    status: 'coming-soon',
    audience: 'all',
  },
  {
    slug: 'playbook',
    name: 'Sales Rep Playbook',
    description: 'Scripts, objections, and training resources',
    url: '#',
    icon: 'BookOpen',
    color: 'orange',
    status: 'coming-soon',
    audience: 'all',
  },
  {
    slug: 'client-command-center',
    name: 'Client Command Center',
    description: 'Your sales team metrics, pipeline, and performance at a glance',
    url: '/[client]/command-center',
    icon: 'BarChart2',
    color: 'blue',
    status: 'live',
    audience: 'client',
  },
  {
    slug: 'closer-dashboard',
    name: 'Closer Dashboard',
    description: 'Your one-stop command center — SOPs, playbooks, and resources',
    url: '/closer-dashboard/[client]',
    icon: 'Monitor',
    color: 'purple',
    status: 'live',
    audience: 'all',
  },
  {
    slug: 'revphlo',
    name: 'RevPhlo',
    description: 'Sales tracking and performance analytics',
    url: 'https://app.revphlo.com',
    icon: 'TrendingUp',
    color: 'yellow',
    status: 'live',
    audience: 'internal',
  },
]
