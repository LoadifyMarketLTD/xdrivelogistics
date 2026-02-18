-- ============================================================
-- VEHICLE DETAILS ENHANCEMENT
-- Extended vehicle management fields
-- ============================================================

-- Add detailed vehicle fields
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS telematics_id TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_reference TEXT, -- What others can see (e.g., "LUTON VAN")
  ADD COLUMN IF NOT EXISTS internal_reference TEXT, -- What you can see (e.g., "DANIEL PREDA")
  ADD COLUMN IF NOT EXISTS body_type TEXT, -- e.g., "Box", "Curtain", "Fridge"
  ADD COLUMN IF NOT EXISTS notify_when_tracked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vin TEXT, -- Vehicle Identification Number
  ADD COLUMN IF NOT EXISTS has_livery BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_tail_lift BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_hiab BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_trailer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_moffet_mounty BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS loading_capacity_m3 NUMERIC,
  ADD COLUMN IF NOT EXISTS length_m NUMERIC,
  ADD COLUMN IF NOT EXISTS width_m NUMERIC,
  ADD COLUMN IF NOT EXISTS height_m NUMERIC,
  ADD COLUMN IF NOT EXISTS max_weight_kg NUMERIC;

-- Rename capacity_kg to be consistent
ALTER TABLE public.vehicles 
  DROP COLUMN IF EXISTS capacity_kg;

-- Create vehicle documents table
CREATE TABLE IF NOT EXISTS public.vehicle_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  expiry_date DATE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_documents_vehicle_id ON public.vehicle_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_expiry_date ON public.vehicle_documents(expiry_date);

-- Enable RLS for vehicle documents
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for vehicle documents
DROP POLICY IF EXISTS "Users can view documents for their company vehicles" ON public.vehicle_documents;
CREATE POLICY "Users can view documents for their company vehicles"
  ON public.vehicle_documents FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM public.vehicles 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage documents for their company vehicles" ON public.vehicle_documents;
CREATE POLICY "Users can manage documents for their company vehicles"
  ON public.vehicle_documents FOR ALL
  USING (
    vehicle_id IN (
      SELECT id FROM public.vehicles 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

GRANT ALL ON public.vehicle_documents TO authenticated;

-- View for vehicles with document count
CREATE OR REPLACE VIEW public.vehicles_with_details AS
SELECT 
  v.*,
  c.name as company_name,
  (SELECT COUNT(*) FROM public.vehicle_documents WHERE vehicle_id = v.id) as document_count,
  (SELECT COUNT(*) FROM public.vehicle_documents 
   WHERE vehicle_id = v.id AND expiry_date < CURRENT_DATE) as expired_documents_count
FROM public.vehicles v
LEFT JOIN public.companies c ON v.company_id = c.id;

GRANT SELECT ON public.vehicles_with_details TO authenticated;

-- Function to check for expiring documents
CREATE OR REPLACE FUNCTION public.get_expiring_vehicle_documents(
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  document_id UUID,
  vehicle_id UUID,
  vehicle_reference TEXT,
  document_name TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vd.id as document_id,
    vd.vehicle_id,
    v.vehicle_reference,
    vd.document_name,
    vd.expiry_date,
    (vd.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM public.vehicle_documents vd
  JOIN public.vehicles v ON vd.vehicle_id = v.id
  WHERE vd.expiry_date IS NOT NULL
    AND vd.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
    AND v.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  ORDER BY vd.expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.vehicle_documents IS 'Documents attached to vehicles (insurance, MOT, etc.)';
COMMENT ON FUNCTION public.get_expiring_vehicle_documents IS 'Returns vehicle documents expiring within specified days';
