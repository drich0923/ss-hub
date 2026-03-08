import { Users, ClipboardCheck, UserPlus, BookOpen, TrendingUp } from 'lucide-react'

export type AppStatus = 'live' | 'coming-soon'

export interface App {
  slug: string
  name: string
  description: string
  url: string
  icon: string
  color: string
  status: AppStatus
}

export const APPS: App[] = [
  {
    slug: 'candidate-app',
    name: 'Candidate Dashboard',
    description: 'Review and manage sales rep applicants',
    url: 'https://candidates.systemizedsales.com',
    icon: 'Users',
    color: 'blue',
    status: 'live',
  },
  {
    slug: 'qc-dashboard',
    name: 'GHL QC Dashboard',
    description: 'Review and score sales call quality',
    url: '#',
    icon: 'ClipboardCheck',
    color: 'green',
    status: 'coming-soon',
  },
  {
    slug: 'rep-onboarding',
    name: 'New Rep Onboarding',
    description: 'Onboarding portal for new sales reps',
    url: '#',
    icon: 'UserPlus',
    color: 'purple',
    status: 'coming-soon',
  },
  {
    slug: 'playbook',
    name: 'Sales Rep Playbook',
    description: 'Scripts, objections, and training resources',
    url: '#',
    icon: 'BookOpen',
    color: 'orange',
    status: 'coming-soon',
  },
  {
    slug: 'revphlo',
    name: 'RevPhlo',
    description: 'Sales tracking and performance analytics',
    url: 'https://revphlo.com',
    icon: 'TrendingUp',
    color: 'yellow',
    status: 'live',
  },
]
