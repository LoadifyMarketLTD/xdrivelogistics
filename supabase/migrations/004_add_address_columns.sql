-- Ensure address columns exist on the companies table.
DO $$
BEGIN
  ALTER TABLE public.companies
    ADD COLUMN IF NOT EXISTS address_line1 text,
    ADD COLUMN IF NOT EXISTS address_line2 text,
    ADD COLUMN IF NOT EXISTS city          text,
    ADD COLUMN IF NOT EXISTS postcode      text;
EXCEPTION WHEN undefined_table THEN NULL;
END
$$;
