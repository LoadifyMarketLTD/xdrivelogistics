// Database types for XDrive Logistics LTD - Public Marketplace

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
  
  // Extended profile fields
  first_name: string | null
  last_name: string | null
  phone_2: string | null
  job_title: string | null
  department: string | null
  time_zone: string
  is_driver: boolean
  web_login_allowed: boolean
  email_visible_to_members: boolean
  has_mobile_account: boolean
  mobile_option: string
  username: string | null
  logo_url: string | null
  interface_language: string
}

export interface UserSettings {
  id: string
  user_id: string
  show_notification_bar: boolean
  enable_load_alerts: boolean
  send_booking_confirmation: boolean
  enroute_alert_hours: number
  alert_distance_uk_miles: number
  alert_distance_euro_miles: number
  despatch_group: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_name: 'Company Admin' | 'Company User' | 'Finance Director' | 
             'Finance Bookkeeper' | 'Driver' | 'Dispatcher' | 'Viewer'
  granted_at: string
}

export interface UserProfileComplete extends Profile {
  show_notification_bar: boolean
  enable_load_alerts: boolean
  send_booking_confirmation: boolean
  enroute_alert_hours: number
  alert_distance_uk_miles: number
  alert_distance_euro_miles: number
  despatch_group: string | null
  company_name: string | null
  roles: string[] | null
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

// PUBLIC MARKETPLACE JOB - Extended for Delivery Tracking
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
  
  // Extended tracking fields
  pickup_address_line1: string | null
  pickup_postcode: string | null
  pickup_city: string | null
  delivery_address_line1: string | null
  delivery_postcode: string | null
  delivery_city: string | null
  distance_miles: number | null
  packaging: string | null
  dimensions: string | null
  requested_vehicle_type: string | null
  
  // Company and booking details
  booked_by_company_name: string | null
  booked_by_company_ref: string | null
  booked_by_phone: string | null
  load_id: string | null
  
  // Payment and rates
  agreed_rate: number | null
  payment_terms: string | null
  smartpay_enabled: boolean
  
  // References
  your_ref: string | null
  cust_ref: string | null
  items: number | null
  
  // Assignment
  vehicle_ref: string | null
  assigned_driver_id: string | null
  
  // Completion
  completed_by_name: string | null
  completed_at: string | null
  
  // Notes
  load_notes: string | null
  pod_required: boolean
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

// Tracking Events
export interface TrackingEvent {
  id: string
  job_id: string
  event_type: 'on_my_way_to_pickup' | 'on_site_pickup' | 'loaded' | 
              'on_my_way_to_delivery' | 'on_site_delivery' | 'delivered'
  event_time: string
  user_id: string | null
  user_name: string | null
  notes: string | null
  created_at: string
}

// Proof of Delivery
export interface ProofOfDelivery {
  id: string
  job_id: string
  delivered_on: string
  received_by: string
  left_at: string | null
  no_of_items: number | null
  delivery_status: 'Completed Delivery' | 'Partial Delivery' | 'Failed Delivery' | 'Refused' | 'Left Safe'
  delivery_notes: string | null
  signature_url: string | null
  photo_urls: string[] | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Job Documents
export interface JobDocument {
  id: string
  job_id: string
  document_type: 'POD' | 'Invoice' | 'Delivery Note' | 'CMR' | 'Photo' | 'Other'
  document_url: string
  document_name: string
  uploaded_by: string | null
  created_at: string
}

// Job Notes
export interface JobNote {
  id: string
  job_id: string
  note_type: 'General' | 'Status Update' | 'Customer Communication' | 'Internal' | 'Issue' | 'Resolution'
  note_text: string
  is_internal: boolean
  created_by: string | null
  created_by_name: string | null
  created_at: string
}

// Job Feedback
export interface JobFeedback {
  id: string
  job_id: string
  from_company_id: string | null
  rating: number | null
  feedback_text: string | null
  feedback_type: 'Positive' | 'Neutral' | 'Negative' | null
  created_at: string
}

// Job Invoice
export interface JobInvoice {
  id: string
  company_id: string
  invoice_number: string
  job_id: string | null
  customer_name: string
  customer_email: string | null
  amount: number
  vat_amount: number
  status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  paid_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Invoice with computed fields
export interface InvoiceWithDetails extends JobInvoice {
  total_amount: number // Computed: amount + vat_amount
  job?: Job
  company_name?: string
}

// Complete Job with all tracking data
export interface JobWithTracking extends Job {
  posted_by_company_name: string | null
  posted_by_company_phone: string | null
  assigned_company_name: string | null
  assigned_company_phone: string | null
  tracking_events?: TrackingEvent[]
  proof_of_delivery?: ProofOfDelivery
  documents?: JobDocument[]
  notes?: JobNote[]
  feedback?: JobFeedback[]
  invoice?: JobInvoice
  tracking_event_count: number
  document_count: number
  note_count: number
}

// Vehicle Types - Fleet Management
export interface Vehicle {
  id: string
  company_id: string
  vehicle_type: string
  registration: string
  make: string | null
  model: string | null
  year: number | null
  notes: string | null
  is_available: boolean
  created_at: string
  updated_at: string
  
  // Enhanced tracking fields
  driver_name: string | null
  current_status: string
  current_location: string | null
  last_tracked_at: string | null
  future_position: string | null
  future_journey: string | null
  advertise_to: string
  notify_when: string | null
  is_tracked: boolean
  vehicle_size: string | null
  
  // Detailed vehicle fields
  telematics_id: string | null
  vehicle_reference: string | null // What others can see
  internal_reference: string | null // What you can see
  body_type: string | null
  notify_when_tracked: boolean
  vin: string | null
  has_livery: boolean
  has_tail_lift: boolean
  has_hiab: boolean
  has_trailer: boolean
  has_moffet_mounty: boolean
  loading_capacity_m3: number | null
  length_m: number | null
  width_m: number | null
  height_m: number | null
  max_weight_kg: number | null
}

export interface VehicleDocument {
  id: string
  vehicle_id: string
  document_name: string
  document_url: string
  expiry_date: string | null
  uploaded_at: string
  uploaded_by: string | null
  created_at: string
}

export interface VehicleTrackingHistory {
  id: string
  vehicle_id: string
  location: string
  status: string | null
  tracked_at: string
  notes: string | null
  created_at: string
}

export interface VehicleWithTracking extends Vehicle {
  company_name: string | null
  company_phone: string | null
  tracking_count: number
}

export interface VehicleWithDetails extends Vehicle {
  company_name: string | null
  document_count: number
  expired_documents_count: number
}
