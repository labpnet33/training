# Supabase email/password authentication starter

## Included
- Email/password registration and login
- Email verification callback page
- Forgot/reset password
- Account session view and logout
- Vercel clean routes

## Install on branch feature/supabase-auth
1. Upload/replace these files in the repository root on your feature branch.
2. Review the changed `vercel.json` and preserve any unrelated project settings.
3. Supabase > Authentication > URL Configuration:
   Site URL: `https://mypnetlab.vercel.app`
   Redirect URL: `https://mypnetlab.vercel.app/**`
4. Supabase > Authentication > Sign In / Providers > Email: enable email sign-up and email confirmation if desired.
5. Deploy a Vercel Preview and test registration, verification, login, password reset and logout.
6. Merge only after testing.

## Important limitations
- This package adds the auth pages; it does not wire login buttons into the existing app's compiled JavaScript bundle.
- The account page's session check is client-side UI only. It does not secure static files or simulator operations. Protect private data/actions with a server-side check or Supabase RLS.
- Test email delivery; Supabase default email sending has restrictions and may require custom SMTP for production.
- `supabase-config.js` contains public Project URL and Publishable key only. Never put a secret/service-role key or database password in frontend code.
