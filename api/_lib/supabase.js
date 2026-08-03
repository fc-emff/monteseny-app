import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // This will show up in Vercel's function logs if env vars are missing.
  console.error(
    'Faltan variables de entorno: SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY. ' +
    'Configúralas en Vercel > Settings > Environment Variables.'
  );
}

// IMPORTANT: this client uses the SERVICE ROLE key, which bypasses Row Level
// Security. It must only ever be imported from files inside /api (server-side
// serverless functions). Never import this file from anything served to the
// browser.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
