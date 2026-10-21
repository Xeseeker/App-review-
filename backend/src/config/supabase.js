const { createClient } = require('@supabase/supabase-js');

const options = { auth: { autoRefreshToken: false, persistSession: false } };
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options);

module.exports = { supabase, supabaseAuth };
