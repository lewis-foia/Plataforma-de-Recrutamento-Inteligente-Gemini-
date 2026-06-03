export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE'
  is_active: boolean
}

export interface Job {
  id: string
  recruiter_id: string
  title: string
  description: string
  education_level: string | null
  experience_years: number
  status: 'OPEN' | 'CLOSED'
  required_skills: string[]
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  candidate_id: string
  original_filename: string
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
  parsed_data: Record<string, unknown> | null
  uploaded_at: string
}

export interface Application {
  id: string
  candidate_id: string
  job_id: string
  resume_id: string | null
  status: string
  applied_at: string
}

export interface CandidateRanking {
  candidate_id: string
  candidate_name: string
  application_id: string
  compatibility_score: number
  justification: string
  skills: string[]
}

export interface DashboardMetrics {
  total_candidates: number
  total_jobs: number
  total_applications: number
  approved_applications: number
  rejected_applications: number
  avg_compatibility: number
  compatibility_distribution: { range: string; count: number }[]
}
