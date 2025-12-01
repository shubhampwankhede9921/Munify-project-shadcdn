export interface Project {
  id: number
  organization_type: string
  organization_id: string
  project_reference_id: string
  title: string
  department: string
  contact_person: string
  contact_person_designation: string
  contact_person_email: string
  contact_person_phone: string
  category: string
  project_stage: string
  description: string
  start_date: string
  end_date: string
  state: string
  city: string
  ward: string
  total_project_cost: string
  funding_requirement: string
  already_secured_funds: string
  commitment_gap: string | null
  currency: string
  fundraising_start_date: string
  fundraising_end_date: string
  municipality_credit_rating: string
  municipality_credit_score: string
  status: string
  visibility: string
  funding_raised: string
  funding_percentage: string | null
  approved_at: string
  approved_by: string
  admin_notes: string
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
  is_favorite?: boolean
  favorite_count?: number
  [key: string]: any
}

export const LIVE_PROJECTS_QUERY_KEY = ["projects", "live"] as const


