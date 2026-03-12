-- Closer Dashboard tables
CREATE TABLE IF NOT EXISTS closer_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_slug text NOT NULL,
  nav_key text NOT NULL,
  title text NOT NULL,
  content jsonb DEFAULT '{}',
  page_type text NOT NULL DEFAULT 'page',
  external_url text,
  loom_url text,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_slug, nav_key)
);
ALTER TABLE closer_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY cp_select ON closer_pages FOR SELECT TO authenticated USING (true);
CREATE POLICY cp_write ON closer_pages FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM manager_profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE TABLE IF NOT EXISTS closer_bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_slug text NOT NULL,
  nav_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, client_slug, nav_key)
);
ALTER TABLE closer_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY cb_select ON closer_bookmarks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY cb_write ON closer_bookmarks FOR ALL TO authenticated USING (user_id = auth.uid());
