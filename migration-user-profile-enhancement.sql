-- ============================================================
-- USER/DRIVER PROFILE ENHANCEMENT
-- Extended user management with driver capabilities
-- ============================================================

-- Extend profiles table with additional user fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS phone_2 TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS time_zone TEXT DEFAULT 'GMT',
  ADD COLUMN IF NOT EXISTS is_driver BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS web_login_allowed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_visible_to_members BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_mobile_account BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mobile_option TEXT DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS interface_language TEXT DEFAULT 'English';

-- User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  show_notification_bar BOOLEAN DEFAULT true,
  enable_load_alerts BOOLEAN DEFAULT true,
  send_booking_confirmation BOOLEAN DEFAULT true,
  enroute_alert_hours INTEGER DEFAULT 4,
  alert_distance_uk_miles INTEGER DEFAULT 10,
  alert_distance_euro_miles INTEGER DEFAULT 50,
  despatch_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- User roles table (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL CHECK (role_name IN (
    'Company Admin',
    'Company User',
    'Finance Director',
    'Finance Bookkeeper',
    'Driver',
    'Dispatcher',
    'Viewer'
  )),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_name)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_name ON public.user_roles(role_name);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR ALL
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Company admins can view settings for company users" ON public.user_settings;
CREATE POLICY "Company admins can view settings for company users"
  ON public.user_settings FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Company admins can manage roles for company users" ON public.user_roles;
CREATE POLICY "Company admins can manage roles for company users"
  ON public.user_roles FOR ALL
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;

-- Trigger for user_settings updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize user settings
CREATE OR REPLACE FUNCTION public.initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_initialize_settings ON auth.users;
CREATE TRIGGER on_user_created_initialize_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_settings();

-- View for complete user profile
CREATE OR REPLACE VIEW public.user_profiles_complete AS
SELECT 
  p.*,
  us.show_notification_bar,
  us.enable_load_alerts,
  us.send_booking_confirmation,
  us.enroute_alert_hours,
  us.alert_distance_uk_miles,
  us.alert_distance_euro_miles,
  us.despatch_group,
  c.name as company_name,
  ARRAY_AGG(DISTINCT ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL) as roles
FROM public.profiles p
LEFT JOIN public.user_settings us ON p.id = us.user_id
LEFT JOIN public.companies c ON p.company_id = c.id
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
GROUP BY p.id, us.show_notification_bar, us.enable_load_alerts, 
         us.send_booking_confirmation, us.enroute_alert_hours,
         us.alert_distance_uk_miles, us.alert_distance_euro_miles,
         us.despatch_group, c.name;

GRANT SELECT ON public.user_profiles_complete TO authenticated;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id UUID,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_phone_2 TEXT DEFAULT NULL,
  p_job_title TEXT DEFAULT NULL,
  p_department TEXT DEFAULT NULL,
  p_time_zone TEXT DEFAULT NULL,
  p_is_driver BOOLEAN DEFAULT NULL,
  p_web_login_allowed BOOLEAN DEFAULT NULL,
  p_email_visible BOOLEAN DEFAULT NULL,
  p_has_mobile BOOLEAN DEFAULT NULL,
  p_mobile_option TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET 
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    phone = COALESCE(p_phone, phone),
    phone_2 = COALESCE(p_phone_2, phone_2),
    job_title = COALESCE(p_job_title, job_title),
    department = COALESCE(p_department, department),
    time_zone = COALESCE(p_time_zone, time_zone),
    is_driver = COALESCE(p_is_driver, is_driver),
    web_login_allowed = COALESCE(p_web_login_allowed, web_login_allowed),
    email_visible_to_members = COALESCE(p_email_visible, email_visible_to_members),
    has_mobile_account = COALESCE(p_has_mobile, has_mobile_account),
    mobile_option = COALESCE(p_mobile_option, mobile_option),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user settings
CREATE OR REPLACE FUNCTION public.update_user_settings_values(
  p_user_id UUID,
  p_notification_bar BOOLEAN DEFAULT NULL,
  p_load_alerts BOOLEAN DEFAULT NULL,
  p_booking_confirmation BOOLEAN DEFAULT NULL,
  p_enroute_hours INTEGER DEFAULT NULL,
  p_uk_miles INTEGER DEFAULT NULL,
  p_euro_miles INTEGER DEFAULT NULL,
  p_despatch_group TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.user_settings (
    user_id,
    show_notification_bar,
    enable_load_alerts,
    send_booking_confirmation,
    enroute_alert_hours,
    alert_distance_uk_miles,
    alert_distance_euro_miles,
    despatch_group
  ) VALUES (
    p_user_id,
    COALESCE(p_notification_bar, true),
    COALESCE(p_load_alerts, true),
    COALESCE(p_booking_confirmation, true),
    COALESCE(p_enroute_hours, 4),
    COALESCE(p_uk_miles, 10),
    COALESCE(p_euro_miles, 50),
    p_despatch_group
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    show_notification_bar = COALESCE(p_notification_bar, user_settings.show_notification_bar),
    enable_load_alerts = COALESCE(p_load_alerts, user_settings.enable_load_alerts),
    send_booking_confirmation = COALESCE(p_booking_confirmation, user_settings.send_booking_confirmation),
    enroute_alert_hours = COALESCE(p_enroute_hours, user_settings.enroute_alert_hours),
    alert_distance_uk_miles = COALESCE(p_uk_miles, user_settings.alert_distance_uk_miles),
    alert_distance_euro_miles = COALESCE(p_euro_miles, user_settings.alert_distance_euro_miles),
    despatch_group = COALESCE(p_despatch_group, user_settings.despatch_group),
    updated_at = NOW();
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_user_role(
  p_user_id UUID,
  p_role_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_role_id UUID;
BEGIN
  INSERT INTO public.user_roles (user_id, role_name)
  VALUES (p_user_id, p_role_name)
  ON CONFLICT (user_id, role_name) DO NOTHING
  RETURNING id INTO v_role_id;
  
  RETURN v_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove role from user
CREATE OR REPLACE FUNCTION public.remove_user_role(
  p_user_id UUID,
  p_role_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.user_roles
  WHERE user_id = p_user_id AND role_name = p_role_name;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.user_settings IS 'Extended settings for user notifications and alerts';
COMMENT ON TABLE public.user_roles IS 'User role assignments for access control';
COMMENT ON FUNCTION public.update_user_profile IS 'Updates user profile with extended fields';
COMMENT ON FUNCTION public.update_user_settings_values IS 'Updates user notification and alert settings';
