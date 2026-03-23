function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl() {
  return getEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabasePublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
