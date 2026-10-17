/* Authentication policy for MyPnetLab.
 * Supabase email/password authentication is required before entering the site.
 */
(function (window, document) {
  'use strict';

  var policy = Object.freeze({
    authenticationRequired: true,
    authMode: 'supabase-email-password',
    defaultPlan: 'CONFIG PRO',
    planKey: 'config-pro',
    courseAccess: 'all',
    allCoursesEnabled: true,
    trialRequired: false
  });

  window.CONFIG_ACCESS_POLICY = policy;
  window.CONFIG_AUTH_DISABLED = false;
  window.CONFIG_DEFAULT_PLAN = policy.defaultPlan;
  window.CONFIG_HAS_FULL_COURSE_ACCESS = true;

  // Keep the app hidden until auth is confirmed and the React app has mounted.
  // Avoid downloading the large simulator bundle for visitors who will be sent to sign-in.
  document.documentElement.classList.add('auth-checking');
  var sessionReady = false;
  var appStarted = false;
  var profileStarted = false;
  var rootObserver;
  var appSrc = '/assets/index-B8_eNnuB-fortigate-dhcp.js?public-access=20261017-sandbox-wheel-zoom-v2';

  function hasCachedSupabaseSession() {
    try {
      var raw = window.localStorage.getItem('sb-nkqsgqjprijmgmkzychf-auth-token');
      if (!raw) return false;
      var cached = JSON.parse(raw);
      return !!(cached && (cached.access_token || cached.refresh_token));
    } catch (error) {
      return false;
    }
  }

  function loadApp() {
    if (appStarted) return;
    appStarted = true;
    var app = document.createElement('script');
    app.type = 'module';
    app.crossOrigin = 'anonymous';
    app.src = appSrc;
    document.head.appendChild(app);
  }

  function loadProfileBridge() {
    if (profileStarted) return;
    profileStarted = true;
    var profile = document.createElement('script');
    profile.type = 'module';
    profile.src = '/profile-bridge.js';
    document.head.appendChild(profile);
  }

  function revealWhenReady() {
    if (!sessionReady) return;
    var root = document.getElementById('root');
    if (!root || root.querySelector('#seo-snapshot') || !root.childElementCount) return;
    document.documentElement.classList.remove('auth-checking');
    if (rootObserver) rootObserver.disconnect();
  }

  window.__MYPNET_AUTH_SESSION_READY__ = function () {
    if (!sessionReady) {
      sessionReady = true;
      loadApp();
      loadProfileBridge();
    }
    var status = document.getElementById('auth-loading-status');
    if (status) status.textContent = 'Loading your learning space…';
    revealWhenReady();
  };

  rootObserver = new MutationObserver(revealWhenReady);
  rootObserver.observe(document.documentElement, { childList: true, subtree: true });
  revealWhenReady();

  window.setTimeout(function () {
    if (!document.documentElement.classList.contains('auth-checking')) return;
    var fallback = document.getElementById('auth-loading-slow');
    if (fallback) fallback.hidden = false;
  }, 12000);

  // Start app download alongside session validation for returning users. For new visitors,
  // wait for the gate's positive session result so the sign-in redirect stays lightweight.
  if (hasCachedSupabaseSession()) loadApp();

  var gate = document.createElement('script');
  gate.type = 'module';
  gate.src = '/auth-gate.js?login=20261017-auth-perf';
  document.head.appendChild(gate);
})(window, document);
