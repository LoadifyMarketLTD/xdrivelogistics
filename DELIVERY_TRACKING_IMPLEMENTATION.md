# XDrive Logistics LTD - Delivery Tracking System Implementation

## Overview

This document describes the comprehensive delivery tracking system implemented for XDrive Logistics LTD, based on Courier Exchange's delivery management functionality. The system provides complete visibility into job lifecycle from booking through delivery with proof of delivery (POD), real-time tracking, document management, and invoicing.

## Implemented Features

### 1. Database Schema Extensions ✅

**New Tables Created:**
- `job_tracking_events` - Real-time tracking timeline
- `proof_of_delivery` - POD records with delivery confirmation
- `job_documents` - Document attachments (POD, invoices, photos, CMR)
- `job_notes` - Order notes and communication history
- `job_feedback` - Rating and feedback system
- `job_invoices` - Invoice management

**Jobs Table Extensions:**
- Detailed location fields (address_line1, postcode, city)
- Distance tracking (miles)
- Packaging and dimensions
- Payment terms and SmartPay flag
- Agreed rate (vs budget)
- Customer references (your_ref, cust_ref)
- Vehicle and driver assignment
- Completion tracking
- Load notes and POD requirements

### 2. Job Detail Page (Courier Exchange Style) ✅

**Location:** `/loads/[id]` 

**Features:**
- Full pickup/delivery addresses with postcodes
- Booked by company information with phone
- Vehicle type (requested vs assigned)
- Distance, weight, packaging, dimensions
- Agreed rate and payment terms
- SmartPay enabled badge
- Load notes display
- Customer references
- Status badges with color coding

### 3. Real-Time Tracking Timeline ✅

**Events Tracked:**
1. **On my Way to Pickup** 🚗 - Driver heading to collection
2. **On Site (Pickup) At** 📍 - Arrived at pickup location
3. **Loaded At** 📦 - Goods loaded
4. **On my Way to Delivery** 🚛 - In transit to delivery
5. **On Site (Delivery) At** 📍 - Arrived at delivery location
6. **Delivered On** ✅ - Delivery completed

Each event includes:
- Timestamp (GMT format)
- User/driver name
- Optional notes
- Status icon

### 4. Proof of Delivery (POD) System ✅

**POD Information Captured:**
- Delivered on (date/time)
- Received by (name of recipient)
- Left at (location, e.g., "Goods Inwards")
- Number of items
- Delivery status:
  - Completed Delivery
  - Partial Delivery
  - Failed Delivery
  - Refused
  - Left Safe
- Delivery notes
- Signature URL (for future implementation)
- Photo URLs (for future implementation)

### 5. Action Buttons ✅

**Available Actions:**
- **Leave Feedback** - Rate and review the delivery/carrier
- **POD** - View/download proof of delivery
- **Order Notes** - Add communication notes
- **History** - View complete job timeline
- **Documents** - Access all job documents
- **View Invoice** - Open invoice details
- **Back to Loads** - Return to loads list

### 6. Document Management ✅

**Document Types Supported:**
- POD (Proof of Delivery)
- Invoice
- Delivery Note
- CMR (International consignment note)
- Photo
- Other

Each document shows:
- Document name
- Type
- Upload date
- View/download button

### 7. Notes & History ✅

**Note Types:**
- General
- Status Update
- Customer Communication
- Internal (hidden from customers)
- Issue
- Resolution

Each note displays:
- Note type badge
- Timestamp
- Note text
- Created by user
- Internal flag if applicable

### 8. TypeScript Type Definitions ✅

**Extended Types:**
```typescript
- Job (extended with 40+ new fields)
- TrackingEvent
- ProofOfDelivery
- JobDocument
- JobNote
- JobFeedback
- JobInvoice
- JobWithTracking (complete view)
```

### 9. Security (RLS Policies) ✅

**Row Level Security implemented for:**
- Tracking events (view/create based on company involvement)
- POD (view/create for assigned companies)
- Documents (view/upload for involved parties)
- Notes (view based on internal flag)
- Feedback (view and create for completed jobs)
- Invoices (view for involved parties)

### 10. Helper Functions ✅

**Database Functions:**
- `record_tracking_event()` - Records event and updates job status
- `create_proof_of_delivery()` - Creates/updates POD and triggers delivered event
- `generate_load_id()` - Auto-generates unique load IDs
- `generate_invoice_number()` - Auto-generates invoice numbers

## Database Migration

**File:** `migration-delivery-tracking.sql`

**To apply migration:**
1. Open Supabase SQL Editor
2. Copy contents of `migration-delivery-tracking.sql`
3. Execute the SQL script
4. Verify all tables and functions are created
5. Check RLS policies are active

**Migration includes:**
- Table creation (IF NOT EXISTS - safe to re-run)
- Column additions (IF NOT EXISTS - safe to re-run)
- Index creation
- RLS policies
- Helper functions
- Views for easy data access

## Usage Examples

### Viewing a Job with Full Details

Navigate to `/loads/[job-id]` to see:
- Complete job information
- Real-time tracking timeline
- POD if delivered
- All documents
- Order history and notes

### Recording Tracking Events

```sql
-- Driver marks "on my way to pickup"
SELECT record_tracking_event(
  'job-uuid',
  'on_my_way_to_pickup',
  'ETA 15 minutes'
);

-- Driver marks "loaded"
SELECT record_tracking_event(
  'job-uuid',
  'loaded',
  '2 pallets loaded successfully'
);

-- Driver marks "delivered"
SELECT record_tracking_event(
  'job-uuid',
  'delivered',
  NULL
);
```

### Creating Proof of Delivery

```sql
SELECT create_proof_of_delivery(
  'job-uuid',
  'JOHN SMITH',           -- received_by
  'Goods Inwards',        -- left_at
  2,                      -- no_of_items
  'Completed Delivery',   -- delivery_status
  'Thank you for your business!'  -- delivery_notes
);
```

### Uploading Documents

```sql
INSERT INTO job_documents (
  job_id,
  document_type,
  document_url,
  document_name,
  uploaded_by
) VALUES (
  'job-uuid',
  'POD',
  'https://storage.url/pod.pdf',
  'POD - Load 79559510.pdf',
  auth.uid()
);
```

## Data Model Example

### Sample Job (Based on Provided Example)

```json
{
  "load_id": "79559510",
  "pickup_location": "CPM Packaging Ltd",
  "pickup_address_line1": "Unit 1 Challenge Way",
  "pickup_postcode": "BB1 5QB",
  "pickup_city": "BLACKBURN",
  
  "delivery_location": "Rubix Sincereal UK",
  "delivery_address_line1": "Off Dock Road South",
  "delivery_postcode": "CH62 4SQ",
  "delivery_city": "BROMBOROUGH",
  
  "pickup_datetime": "2026-02-17T11:30:00Z",
  "delivery_datetime": null,  // ASAP
  
  "vehicle_type": "S/Van",
  "requested_vehicle_type": "Small Van",
  "vehicle_ref": "DANIEL PREDA",
  
  "booked_by_company_name": "MLH TRANSPORT LIMITED",
  "booked_by_company_ref": "GB 18886",
  "booked_by_phone": "+44 1353666076",
  
  "agreed_rate": 45.00,
  "payment_terms": "30 Days (End Of Month)",
  "smartpay_enabled": true,
  
  "distance_miles": 50.3,
  "weight_kg": 138,
  "packaging": "1 pallet",
  "dimensions": "60 x 60 x 46cm",
  
  "your_ref": "265078",
  "cust_ref": "79559510",
  "items": 1,
  
  "load_notes": "1 pallet 60 x 60 x 46cm 138kg. Please present as MLH Transport - ref TBA",
  
  "status": "completed",
  "completed_by_name": "Ion",
  "completed_at": "2026-02-17T14:22:00Z"
}
```

### Sample Tracking Events

```json
[
  {
    "event_type": "on_my_way_to_pickup",
    "event_time": "2026-02-17T11:49:00Z",
    "user_name": "Ion"
  },
  {
    "event_type": "on_site_pickup",
    "event_time": "2026-02-17T12:04:00Z",
    "user_name": "Ion"
  },
  {
    "event_type": "loaded",
    "event_time": "2026-02-17T12:13:00Z",
    "user_name": "Ion"
  },
  {
    "event_type": "on_site_delivery",
    "event_time": "2026-02-17T13:58:00Z",
    "user_name": "Ion"
  },
  {
    "event_type": "delivered",
    "event_time": "2026-02-17T14:22:00Z",
    "user_name": "Ion"
  }
]
```

### Sample POD

```json
{
  "delivered_on": "2026-02-17T14:22:00Z",
  "received_by": "KIERAN O SULLIVAN",
  "left_at": "Goods Inwards",
  "no_of_items": 1,
  "delivery_status": "Completed Delivery",
  "delivery_notes": "Thank you very much for your work, feedback and advance payment help us operate and provide quality services."
}
```

## Next Steps (Future Implementation)

### High Priority
1. **Driver Mobile App** - For recording tracking events and POD
2. **POD Entry Form** - Web interface for drivers
3. **Document Upload** - File upload functionality
4. **Feedback System** - Rating and review forms
5. **Invoice Generation** - Automated invoice creation
6. **Email Notifications** - Status update emails

### Medium Priority
7. **SMS Notifications** - Real-time SMS updates
8. **GPS Tracking Integration** - Live vehicle location
9. **Digital Signature Capture** - For POD
10. **Photo Upload** - Delivery photos
11. **Customer Portal** - For tracking their deliveries
12. **Replay Feature** - Playback of vehicle journey

### Low Priority
13. **Analytics Dashboard** - Delivery performance metrics
14. **Export Functions** - Export to CSV/PDF
15. **API Endpoints** - For third-party integrations
16. **Webhook Support** - Event notifications

## Technical Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend:** Supabase (PostgreSQL)
- **Styling:** Inline styles (XDrive Logistics LTD branding)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for documents - future)

## Branding

All components use **XDrive Logistics LTD** branding:
- Company name displayed consistently
- Copyright: © 2021 XDrive Logistics LTD
- Color scheme matches existing portal design
- Courier Exchange functionality with XDrive styling

## Performance Considerations

- Indexed all foreign keys
- RLS policies optimized for company-based queries
- Views created for common data access patterns
- Pagination support (for future large datasets)
- Efficient timestamp indexing for tracking events

## Security Features

- Row Level Security (RLS) on all new tables
- Company-based data isolation
- Internal notes hidden from customers
- Document access controlled by job involvement
- Secure helper functions with SECURITY DEFINER

## Compliance

- GDPR ready (personal data in separate tables)
- Audit trail via timestamps
- Note tracking for communication records
- Document retention management (future)

## Support

For questions or issues:
- Review migration SQL for database structure
- Check TypeScript types in `lib/types.ts`
- See job detail page at `app/(portal)/loads/[id]/page.tsx`
- Refer to this documentation

---

**Implementation Date:** February 2026  
**Version:** 1.0  
**Author:** XDrive Logistics LTD Development Team
