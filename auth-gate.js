import { supabase } from '/supabase-config.js';

const AUTH_PAGES = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email'
]);

const path = window.location.pathname.replace(/\/$/, '') || '/';

function safeNextPath() {
  const value = window.location.pathname + window.location.search + window.location.hash;
  return value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

function redirectToLogin() {
  const next = safeNextPath();
  const query = next === '/' ? '' : `?next=${encodeURIComponent(next)}`;
  window.location.replace(`/login${query}`);
}

async function enforceSession() {
  if (AUTH_PAGES.has(path)) {
    document.documentElement.style.visibility = '';
    return;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (!data.session) {
      // The home route is the registration entry point for new visitors.
      // Existing users can choose Sign in from that page.
      window.location.replace(path === '/' ? '/register' : `/login?next=${encodeURIComponent(safeNextPath())}`);
      return;
    }
    document.documentElement.style.visibility = '';
  } catch (error) {
    console.error('Authentication check failed:', error);
    redirectToLogin();
  }
}

enforceSession();
