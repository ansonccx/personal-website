# Personal Website with Supabase Admin

This site now supports a proper admin workflow:

- `index.html`: public homepage
- `admin.html`: login and project management panel
- `supabase-config.js`: Supabase project URL and publishable key
- `supabase-setup.sql`: SQL for creating the `projects` table and RLS policies

## Setup

1. Create a Supabase project.
2. In Supabase, run the SQL from `supabase-setup.sql`.
3. In `supabase-config.js`, fill in:
   - `url`
   - `anonKey`
4. In Supabase Auth settings, disable public signups.
5. Create your admin user in the Supabase dashboard.
6. Open `admin.html`, log in, and manage projects there.

## Notes

- The public homepage reads published projects from Supabase.
- If Supabase is not configured yet, the homepage shows fallback placeholder cards.
- The publishable key is safe to use in the frontend. Do not put the service role key in this project.
