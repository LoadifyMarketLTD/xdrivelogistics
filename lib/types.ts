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
  
  // Tracking timestamps
  on_my_way?: string | null
  loaded_at?: string | null
  on_site_pickup?: string | null
  on_site_delivery?: string | null
  delivered_on?: string | null
  
  // POD (Proof of Delivery) fields
  received_by?: string | null
  left_at?: string | null
  no_of_items?: number | null
  delivery_status?: string | null
  pod_notes?: string | null
  
  // Payment and rate fields
  payment_terms?: string | null
  smartpay_enabled?: boolean | null
  agreed_rate?: number | null
  
  // Vehicle and customer references
  vehicle_ref?: string | null
  your_ref?: string | null
  cust_ref?: string | null
  
  // Packaging and dimensions
  packaging?: string | null
  length_cm?: number | null
  width_cm?: number | null
  height_cm?: number | null
  distance_miles?: number | null
  
  // Booked by company information
  booked_by_company_name?: string | null
  booked_by_company_phone?: string | null
  booked_by_company_email?: string | null
  
  // Pickup address fields
  pickup_address_line1?: string | null
  pickup_address_line2?: string | null
  pickup_city?: string | null
  pickup_postcode?: string | null
  pickup_country?: string | null
  
  // Delivery address fields
  delivery_address_line1?: string | null
  delivery_address_line2?: string | null
  delivery_city?: string | null
  delivery_postcode?: string | null
  delivery_country?: string | null
  
  // Assigned vehicle type
  assigned_vehicle_type?: string | null
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

// DELIVERY TRACKING TYPES

export interface TrackingEvent {
  id: string
  job_id: string
  event_type: 'created' | 'assigned' | 'on_my_way' | 'loaded' | 'on_site_pickup' | 'on_site_delivery' | 'delivered' | 'completed' | 'cancelled' | 'note_added' | 'document_uploaded'
  event_timestamp: string
  user_id?: string | null
  company_id?: string | null
  event_data?: any | null
  notes?: string | null
  location?: string | null
  created_at: string
}

export interface ProofOfDelivery {
  received_by: string
  left_at?: string | null
  no_of_items?: number | null
  delivery_status: string
  pod_notes?: string | null
  delivered_on: string
}

export interface JobDocument {
  id: string
  job_id: string
  document_type: 'pod' | 'invoice' | 'photo' | 'signature' | 'cmr' | 'other'
  file_name: string
  file_url: string
  file_size?: number | null
  mime_type?: string | null
  uploaded_by?: string | null
  uploaded_at: string
  notes?: string | null
  created_at: string
}

export interface JobNote {
  id: string
  job_id: string
  user_id: string
  note_type: 'general' | 'internal' | 'customer' | 'driver' | 'alert'
  note_text: string
  is_internal: boolean
  created_at: string
  updated_at: string
}

export interface JobFeedback {
  id: string
  job_id: string
  rating: number
  feedback_text?: string | null
  given_by_company_id: string
  given_to_company_id: string
  created_at: string
}

export interface JobInvoice {
  id: string
  job_id: string
  invoice_number: string
  invoice_date: string
  due_date?: string | null
  amount: number
  vat_amount?: number | null
  total_amount: number
  status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_method?: string | null
  paid_date?: string | null
  notes?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface JobWithTracking extends Job {
  poster_company_name?: string | null
  poster_company_phone?: string | null
  poster_company_email?: string | null
  assigned_company_name?: string | null
  assigned_company_phone?: string | null
  tracking_events_count?: number | null
  documents_count?: number | null
  notes_count?: number | null
  latest_event_type?: string | null
  latest_event_timestamp?: string | null
  tracking_events?: TrackingEvent[]
  documents?: JobDocument[]
  notes?: JobNote[]
  feedback?: JobFeedback[]
  invoices?: JobInvoice[]
}
