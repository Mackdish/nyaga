-- Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'percent',
  amount numeric NOT NULL DEFAULT 0,
  minimum_spend numeric NOT NULL DEFAULT 0,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone views active coupons" ON public.coupons
  FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'));

-- Store settings (key-value)
CREATE TABLE public.store_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads settings" ON public.store_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins write settings" ON public.store_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed default settings
INSERT INTO public.store_settings (key, value) VALUES
  ('general', '{"currency":"KES","store_name":"Intech Computer Shop","store_address":"Moi Avenue, Nairobi","store_phone":"+254728394362","store_email":"info@intechcomputershop.co.ke"}'::jsonb),
  ('payments', '{"mpesa":true,"stripe":false,"paypal":false,"cod":true,"bank_transfer":false}'::jsonb),
  ('shipping', '{"zones":[{"name":"Nairobi CBD","fee":0},{"name":"Nairobi Metro","fee":300},{"name":"Other Counties","fee":700}]}'::jsonb),
  ('tax', '{"vat_percent":16,"prices_include_tax":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;