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

function hasCachedSession() {
  try {
    const raw = window.localStorage.getItem('sb-nkqsgqjprijmgmkzychf-auth-token');
    const cached = raw ? JSON.parse(raw) : null;
    return !!(cached && (cached.access_token || cached.refresh_token));
  } catch (error) {
    return false;
  }
}

async function enforceSession() {
  if (AUTH_PAGES.has(path)) {
    document.documentElement.style.visibility = '';
    return;
  }

  try {
    const { supabase } = await import('/supabase-config.js');
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise(resolve => setTimeout(() => resolve({ timedOut: true }), 10000))
    ]);
    if (result?.timedOut) {
      if (hasCachedSession() && typeof window.__MYPNET_AUTH_SESSION_READY__ === 'function') {
        console.warn('Authentication check timed out; continuing with the cached session.');
        window.__MYPNET_AUTH_SESSION_READY__();
        return;
      }
      throw new Error('Authentication check timed out.');
    }
    const { data, error } = result;
    if (error) throw error;

    if (!data.session) {
      // Ask unauthenticated visitors to sign in first; account creation remains linked from login.
      window.location.replace(path === '/' ? '/login' : `/login?next=${encodeURIComponent(safeNextPath())}`);
      return;
    }
    if (typeof window.__MYPNET_AUTH_SESSION_READY__ === 'function') {
      window.__MYPNET_AUTH_SESSION_READY__();
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    redirectToLogin();
  }
}

enforceSession();
