import postgres from "postgres";

// Supabase direct connection (session mode pooler)
// You need to set SUPABASE_DB_PASSWORD env var or pass it here
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.argv[2] || "";

if (!DB_PASSWORD) {
  console.error("Usage: SUPABASE_DB_PASSWORD=xxx npx tsx src/scripts/run-migration.ts");
  console.error("  or:  npx tsx src/scripts/run-migration.ts <password>");
  console.error("\nFind your DB password in: Supabase Dashboard → Settings → Database → Connection string");
  process.exit(1);
}

const sql = postgres({
  host: "aws-0-us-east-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  username: "postgres.cdvsrkwcekckqvwhsyjh",
  password: DB_PASSWORD,
  ssl: "require",
});

async function run() {
  console.log("Running closer-dashboard migration...");

  await sql`
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
    )
  `;
  console.log("  closer_pages table created");

  await sql`ALTER TABLE closer_pages ENABLE ROW LEVEL SECURITY`;

  // Drop policies if they exist, then recreate
  await sql`DROP POLICY IF EXISTS cp_select ON closer_pages`;
  await sql`DROP POLICY IF EXISTS cp_write ON closer_pages`;
  await sql`CREATE POLICY cp_select ON closer_pages FOR SELECT TO authenticated USING (true)`;
  await sql`CREATE POLICY cp_write ON closer_pages FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM manager_profiles WHERE user_id = auth.uid() AND role = 'admin')
  )`;
  console.log("  closer_pages RLS policies created");

  await sql`
    CREATE TABLE IF NOT EXISTS closer_bookmarks (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      client_slug text NOT NULL,
      nav_key text NOT NULL,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, client_slug, nav_key)
    )
  `;
  console.log("  closer_bookmarks table created");

  await sql`ALTER TABLE closer_bookmarks ENABLE ROW LEVEL SECURITY`;
  await sql`DROP POLICY IF EXISTS cb_select ON closer_bookmarks`;
  await sql`DROP POLICY IF EXISTS cb_write ON closer_bookmarks`;
  await sql`CREATE POLICY cb_select ON closer_bookmarks FOR SELECT TO authenticated USING (user_id = auth.uid())`;
  await sql`CREATE POLICY cb_write ON closer_bookmarks FOR ALL TO authenticated USING (user_id = auth.uid())`;
  console.log("  closer_bookmarks RLS policies created");

  console.log("\nMigration complete!");
  await sql.end();
}

run().catch(e => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
