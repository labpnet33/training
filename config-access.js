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

  // Keep protected app content hidden while auth and React bootstrap run,
  // but show a progress screen instead of leaving a blank document.
  document.documentElement.classList.add('auth-checking');
  var sessionReady = false;
  var rootObserver;
  function revealWhenReady() {
    if (!sessionReady) return;
    var root = document.getElementById('root');
    if (!root || root.querySelector('#seo-snapshot') || !root.childElementCount) return;
    document.documentElement.classList.remove('auth-checking');
    if (rootObserver) rootObserver.disconnect();
  }
  window.__MYPNET_AUTH_SESSION_READY__ = function () {
    sessionReady = true;
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

  var gate = document.createElement('script');
  gate.type = 'module';
  gate.src = '/auth-gate.js?login=20261017-root-loading';
  document.head.appendChild(gate);
  var profile = document.createElement('script');
  profile.type = 'module';
  profile.src = '/profile-bridge.js';
  document.head.appendChild(profile);
})(window, document);
