export const supabaseConfig = {
  url: "https://mxmgwzxhwdcggxvlwbdo.supabase.co",
  anonKey: "sb_publishable_ZcAd-nX6WUKp-bP2OPWeog_DO8l0F05"
};

export const appConfig = {
  projectsTable: "projects"
};

export function hasSupabaseConfig() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}
