CREATE TABLE IF NOT EXISTS public.command_center_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client text NOT NULL UNIQUE,
  quick_links jsonb,
  team_members jsonb,
  support_channels jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

CREATE INDEX IF NOT EXISTS idx_cc_configs_client ON public.command_center_configs(client);

ALTER TABLE public.command_center_configs ENABLE ROW LEVEL SECURITY;

-- Admins can do everything; others can only read their own client
CREATE POLICY "Admins full access" ON public.command_center_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.manager_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users read own client" ON public.command_center_configs
  FOR SELECT USING (
    client = (
      SELECT mp.client FROM public.manager_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );
