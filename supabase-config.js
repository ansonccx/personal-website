export const supabaseConfig = {
  url: "",
  anonKey: ""
};

export const appConfig = {
  projectsTable: "projects"
};

export function hasSupabaseConfig() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}
