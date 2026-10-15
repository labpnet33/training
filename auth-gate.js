import { supabase } from '/supabase-config.js';

// Pages that visitors may access without signing in.
const PUBLIC_PATHS = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/pricing'
];

async function checkAuthentication() {
  const path = window.location.pathname;

  // Allow public pages.
  if (PUBLIC_PATHS.includes(path)) {
    return;
  }

  // Check the current Supabase session.
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Authentication check failed:', error);
    return;
  }

  // Redirect logged-out visitors to login.
  if (!data.session) {
    const next = encodeURIComponent(
      window.location.pathname +
      window.location.search +
      window.location.hash
    );

    window.location.replace(`/login?next=${next}`);
  }
}

checkAuthentication();
