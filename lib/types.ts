// Database types for XDrive Logistics - Public Marketplace

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  company_id: string | null
  role: 'admin' | 'dispatcher' | 'driver' | 'viewer'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  user_id: string
  first_name: string
  last_name: string
  phone: string | null
  license_type: string
  created_at: string
  updated_at: string
}

// PUBLIC MARKETPLACE JOB
export interface Job {
  id: string
  created_at: string
  updated_at: string
  posted_by_company_id: string
  status: 'open' | 'assigned' | 'in-transit' | 'completed' | 'cancelled'
  pickup_location: string
  delivery_location: string
  pickup_datetime: string | null
  delivery_datetime: string | null
  vehicle_type: string | null
  load_details: string | null
  pallets: number | null
  weight_kg: number | null
  budget: number | null
  assigned_company_id: string | null
  accepted_bid_id: string | null
}

// MARKETPLACE BID
export interface JobBid {
  id: string
  created_at: string
  job_id: string
  bidder_company_id: string
  bidder_user_id: string
  quote_amount: number
  message: string | null
  status: 'submitted' | 'withdrawn' | 'rejected' | 'accepted'
}

// Form data types
export interface JobFormData {
  pickup_location: string
  delivery_location: string
  pickup_datetime?: string
  delivery_datetime?: string
  vehicle_type?: string
  load_details?: string
  pallets?: number
  weight_kg?: number
  budget?: number
}

export interface BidFormData {
  job_id: string
  quote_amount: number
  message?: string
}

// Join types for display
export interface JobWithBids extends Job {
  bids?: JobBid[]
  poster_company?: Company
}

export interface BidWithJob extends JobBid {
  job?: Job
}
