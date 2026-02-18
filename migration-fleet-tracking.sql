-- ============================================================
-- MY FLEET - VEHICLE TRACKING ENHANCEMENT
-- Courier Exchange-style fleet management
-- ============================================================

-- Add enhanced tracking fields to vehicles table
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS driver_name TEXT,
  ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'Waiting for next job (available)',
  ADD COLUMN IF NOT EXISTS current_location TEXT,
  ADD COLUMN IF NOT EXISTS last_tracked_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS future_position TEXT,
  ADD COLUMN IF NOT EXISTS future_journey TEXT,
  ADD COLUMN IF NOT EXISTS advertise_to TEXT DEFAULT 'General Exchange',
  ADD COLUMN IF NOT EXISTS notify_when TEXT,
  ADD COLUMN IF NOT EXISTS is_tracked BOOLEAN DEFAULT true;

-- Add vehicle size field (separate from type for display)
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS vehicle_size TEXT; -- e.g., "Luton", "MWB", "LWB", "SWB"

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_vehicles_current_location ON public.vehicles(current_location);
CREATE INDEX IF NOT EXISTS idx_vehicles_last_tracked ON public.vehicles(last_tracked_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_name ON public.vehicles(driver_name);

-- Create vehicle tracking history table
CREATE TABLE IF NOT EXISTS public.vehicle_tracking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  status TEXT,
  tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_history_vehicle_id ON public.vehicle_tracking_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tracking_history_tracked_at ON public.vehicle_tracking_history(tracked_at DESC);

-- Enable RLS for tracking history
ALTER TABLE public.vehicle_tracking_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for tracking history
DROP POLICY IF EXISTS "Users can view tracking history for their company vehicles" ON public.vehicle_tracking_history;
CREATE POLICY "Users can view tracking history for their company vehicles"
  ON public.vehicle_tracking_history FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM public.vehicles 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert tracking history for their company vehicles" ON public.vehicle_tracking_history;
CREATE POLICY "Users can insert tracking history for their company vehicles"
  ON public.vehicle_tracking_history FOR INSERT
  WITH CHECK (
    vehicle_id IN (
      SELECT id FROM public.vehicles 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

GRANT ALL ON public.vehicle_tracking_history TO authenticated;

-- Helper function to update vehicle location and log history
CREATE OR REPLACE FUNCTION public.update_vehicle_location(
  p_vehicle_id UUID,
  p_location TEXT,
  p_status TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
BEGIN
  -- Update vehicle's current location
  UPDATE public.vehicles
  SET 
    current_location = p_location,
    current_status = COALESCE(p_status, current_status),
    last_tracked_at = NOW()
  WHERE id = p_vehicle_id;

  -- Log to history
  INSERT INTO public.vehicle_tracking_history (
    vehicle_id,
    location,
    status,
    tracked_at,
    notes
  ) VALUES (
    p_vehicle_id,
    p_location,
    p_status,
    NOW(),
    p_notes
  )
  RETURNING id INTO v_history_id;

  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get vehicles with latest tracking info
CREATE OR REPLACE VIEW public.vehicles_with_tracking AS
SELECT 
  v.*,
  c.name as company_name,
  c.phone as company_phone,
  (SELECT COUNT(*) FROM public.vehicle_tracking_history WHERE vehicle_id = v.id) as tracking_count
FROM public.vehicles v
LEFT JOIN public.companies c ON v.company_id = c.id;

GRANT SELECT ON public.vehicles_with_tracking TO authenticated;

COMMENT ON TABLE public.vehicle_tracking_history IS 'Tracks location history for fleet vehicles';
COMMENT ON FUNCTION public.update_vehicle_location IS 'Updates vehicle location and logs to history';
