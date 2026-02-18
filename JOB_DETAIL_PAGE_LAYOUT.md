# Job Detail Page - Visual Layout Documentation

## Page Structure: `/loads/[id]`

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ← Back to Loads                                                        │
│  Load Details                                       [Live] [Status]     │
│  Job ID: abc123... [📋 Copy]                                            │
│                                                                         │
├─────────────────────────────────┬───────────────────────────────────────┤
│                                 │                                       │
│  📍 Pickup Information          │  🎯 Delivery Information             │
│  ─────────────────────          │  ────────────────────────             │
│  Location                       │  Location                            │
│  123 High Street, London        │  456 Main Road, Birmingham           │
│                                 │                                      │
│  Postcode                       │  Postcode                            │
│  SW1A 1AA                       │  B1 1AA                             │
│                                 │                                      │
│  Pickup Date & Time             │  Delivery Date & Time                │
│  12/01/2026, 09:00              │  12/01/2026, 15:00                  │
│                                 │  Distance: 120 miles                 │
└─────────────────────────────────┴───────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🏢 Booked By                                                           │
│  ─────────────────────────────────────────────────────────────────      │
│  Company Name            Phone                 Email                    │
│  ABC Logistics Ltd       📞 020 1234 5678     ✉️ contact@abc.com       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  💰 Rate & Payment                                                      │
│  ─────────────────────────────────────────────────────────────────      │
│  Budget        Agreed Rate      Payment Terms    Payment Method        │
│  £500.00       £475.00          NET 30           ⚡ SmartPay Enabled   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🚛 Vehicle & Load Details                                              │
│  ─────────────────────────────────────────────────────────────────────  │
│  Vehicle Requested  Assigned Vehicle   Vehicle Ref    Weight            │
│  Large Van          Large Van          VAN123         500 kg            │
│                                                                         │
│  Packaging         Pallets            Dimensions (L × W × H)            │
│  Palletised        2                  120 × 80 × 100 cm                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  📋 References                                                          │
│  ─────────────────────────────────────────────────────────────────      │
│  Your Reference                  Customer Reference                     │
│  JOB-2026-001                   CUST-REF-456                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  📝 Additional Details                                                  │
│  ─────────────────────────────────────────────────────────────────      │
│  Fragile items, handle with care. Requires tail lift for delivery.     │
│  Contact site manager 30 minutes before arrival.                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Features

### Visual Design
- ✅ Clean, flat business design (matches Courier Exchange style)
- ✅ White cards with subtle borders (no rounded corners)
- ✅ Clear section headers with icons
- ✅ Grid-based layout for efficient space usage
- ✅ Consistent typography and spacing

### Information Display
- ✅ **Full Addresses**: Complete pickup/delivery addresses with all fields
- ✅ **Postcodes**: Prominently displayed in bold
- ✅ **Company Info**: All booking company contact details
- ✅ **Rate Comparison**: Budget shown alongside agreed rate
- ✅ **Vehicle Comparison**: Requested vs assigned vehicle types
- ✅ **SmartPay Badge**: Green badge with lightning icon
- ✅ **Complete Dimensions**: Length × Width × Height display
- ✅ **Weight & Packaging**: Clear load specifications
- ✅ **References**: Both customer references side-by-side

### User Experience
- ✅ **Copy Job ID**: One-click clipboard copy with visual feedback
- ✅ **Back Navigation**: Easy return to loads listing
- ✅ **Status Badge**: Color-coded status indicator
- ✅ **Organized Sections**: Logical grouping of related information
- ✅ **Responsive Grid**: Adapts to screen size

### Color Coding
- 🟢 **Green**: Agreed rate, assigned vehicle, SmartPay badge
- 🔵 **Blue**: Links and interactive elements
- ⚫ **Dark Gray**: Primary text
- 🔘 **Gray**: Secondary text and labels
- 🟡 **Gold**: Status badges for live/allocated
- 🔴 **Red**: Cancelled status

## Data Fields Displayed

### Location Information
- ✅ pickup_address_line1, pickup_address_line2
- ✅ pickup_city, pickup_postcode, pickup_country
- ✅ delivery_address_line1, delivery_address_line2
- ✅ delivery_city, delivery_postcode, delivery_country
- ✅ pickup_datetime, delivery_datetime
- ✅ distance_miles

### Company Information
- ✅ booked_by_company_name
- ✅ booked_by_company_phone (with 📞 icon)
- ✅ booked_by_company_email (with ✉️ icon)

### Financial Information
- ✅ budget (with £ symbol)
- ✅ agreed_rate (highlighted in green)
- ✅ payment_terms
- ✅ smartpay_enabled (green badge)

### Vehicle & Load
- ✅ vehicle_type (requested)
- ✅ assigned_vehicle_type (highlighted)
- ✅ vehicle_ref
- ✅ weight_kg
- ✅ packaging
- ✅ pallets
- ✅ length_cm, width_cm, height_cm

### References & Details
- ✅ your_ref
- ✅ cust_ref
- ✅ load_details

## Integration Points

### From Loads Listing
```typescript
// Button added to loads listing page
<button onClick={() => router.push(`/loads/${load.id}`)}>
  View Details
</button>
```

### TypeScript Types
```typescript
// Uses JobWithTracking interface from lib/types.ts
interface JobWithTracking extends Job {
  // 60+ tracking fields available
  booked_by_company_name?: string | null
  pickup_postcode?: string | null
  agreed_rate?: number | null
  smartpay_enabled?: boolean | null
  // ... and more
}
```

## Responsive Behavior
- Desktop: 2-column grid for location cards
- Mobile: Stacks to single column
- All grids adapt to smaller screens
- Consistent padding and spacing

## Future Enhancements (Phases 3-8)
- [ ] Tracking timeline visualization
- [ ] POD upload capability
- [ ] Document management
- [ ] Notes and messaging
- [ ] Status update actions
- [ ] Real-time notifications
- [ ] Invoice display
- [ ] Feedback/rating system
