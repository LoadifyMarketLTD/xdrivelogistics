// Database types for XDrive Logistics

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
  company_id: string
  full_name: string
  phone: string
  email: string | null
  license_number: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  company_id: string
  job_code: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  pickup: string
  pickup_postcode: string | null
  delivery: string
  delivery_postcode: string | null
  price: number
  cost: number | null
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled'
  driver_id: string | null
  scheduled_date: string | null
  scheduled_time: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
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

export interface JobFormData {
  pickup: string
  pickup_postcode?: string
  delivery: string
  delivery_postcode?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  price: number
  cost?: number
  status?: Job['status']
  scheduled_date?: string
  scheduled_time?: string
  notes?: string
}

export interface DriverFormData {
  full_name: string
  phone: string
  email?: string
  license_number?: string
  notes?: string
}

export interface InvoiceFormData {
  job_id?: string
  customer_name: string
  customer_email?: string
  amount: number
  vat_amount?: number
  due_date: string
  notes?: string
}
