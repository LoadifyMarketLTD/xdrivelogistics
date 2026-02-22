// ─────────────────────────────────────────────────────────────
// Database Types — mirrors public schema enums and tables
// ─────────────────────────────────────────────────────────────

export type CompanyRole = 'owner' | 'admin' | 'dispatcher' | 'viewer';
export type MembershipStatus = 'invited' | 'active' | 'suspended';
export type DocStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type JobStatus = 'draft' | 'posted' | 'allocated' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed';
export type CargoType = 'general' | 'pallet' | 'fragile' | 'hazardous' | 'refrigerated' | 'oversized';
export type VehicleType = 'small_van' | 'transit_van' | 'luton_van' | 'curtainsider' | 'flatbed' | 'tipper' | 'artic' | 'other';
export type TrackingEventType = 'created' | 'assigned' | 'collected' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_delivery' | 'returned' | 'delayed' | 'note_added';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  trading_name: string | null;
  company_number: string | null;
  vat_number: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  address_city: string | null;
  address_county: string | null;
  address_postcode: string | null;
  address_country: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyMembership {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
  status: MembershipStatus;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  company_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  licence_number: string | null;
  licence_expiry: string | null;
  dbs_check_date: string | null;
  dbs_expiry: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  company_id: string;
  registration: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vehicle_type: VehicleType;
  max_payload_kg: number | null;
  max_volume_m3: number | null;
  is_active: boolean;
  notes: string | null;
  mot_expiry: string | null;
  tax_expiry: string | null;
  insurance_expiry: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  company_id: string;
  document_type: string;
  file_url: string;
  file_name: string | null;
  status: DocStatus;
  expiry_date: string | null;
  notes: string | null;
  uploaded_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  company_id: string;
  document_type: string;
  file_url: string;
  file_name: string | null;
  status: DocStatus;
  expiry_date: string | null;
  notes: string | null;
  uploaded_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbJob {
  id: string;
  company_id: string;
  job_ref: string;
  status: JobStatus;
  cargo_type: CargoType;
  description: string | null;
  weight_kg: number | null;
  volume_m3: number | null;
  pallet_count: number | null;
  pickup_address: string;
  pickup_city: string | null;
  pickup_postcode: string | null;
  pickup_contact_name: string | null;
  pickup_contact_phone: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  delivery_address: string;
  delivery_city: string | null;
  delivery_postcode: string | null;
  delivery_contact_name: string | null;
  delivery_contact_phone: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  assigned_driver_id: string | null;
  assigned_vehicle_id: string | null;
  quoted_price: number | null;
  agreed_price: number | null;
  currency: string;
  payment_terms: string | null;
  customer_ref: string | null;
  special_instructions: string | null;
  is_return_journey: boolean;
  pod_photo_url: string | null;
  pod_signature_url: string | null;
  pod_delivered_at: string | null;
  pod_received_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobBid {
  id: string;
  job_id: string;
  company_id: string;
  bidder_id: string;
  amount: number;
  currency: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
}

export interface JobNote {
  id: string;
  job_id: string;
  company_id: string;
  author_id: string | null;
  note_type: 'general' | 'delay' | 'system' | 'customer';
  content: string;
  is_visible_to_customer: boolean;
  created_at: string;
}

export interface JobDocument {
  id: string;
  job_id: string;
  company_id: string;
  document_type: string;
  file_url: string;
  file_name: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  job_id: string | null;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  heading_degrees: number | null;
  speed_kmh: number | null;
  recorded_at: string;
}

export interface ReturnJourney {
  id: string;
  original_job_id: string;
  company_id: string;
  return_address: string;
  return_city: string | null;
  return_postcode: string | null;
  return_date: string | null;
  return_time: string | null;
  status: JobStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  company_id: string;
  quote_ref: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_company: string | null;
  pickup_address: string | null;
  pickup_city: string | null;
  pickup_postcode: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_postcode: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  cargo_type: CargoType | null;
  description: string | null;
  weight_kg: number | null;
  volume_m3: number | null;
  pallet_count: number | null;
  quoted_price: number | null;
  currency: string;
  vat_rate: number;
  vat_amount: number | null;
  total_amount: number | null;
  payment_terms: string | null;
  notes: string | null;
  valid_until: string | null;
  converted_to_job_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
