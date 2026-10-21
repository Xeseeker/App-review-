const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];

function requireEnvironment() {
  const missing = required.filter((key) => !process.env[key] || process.env[key].includes('YOUR_'));
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill it in.`);
  }
}

module.exports = { requireEnvironment };
