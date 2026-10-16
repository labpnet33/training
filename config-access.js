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

  // Hide the app until the session gate has checked Supabase. The gate runs
  // before the application bundle and redirects logged-out visitors.
  document.documentElement.style.visibility = 'hidden';
  var gate = document.createElement('script');
  gate.type = 'module';
  gate.src = '/auth-gate.js';
  document.head.appendChild(gate);
  var profile = document.createElement('script');
  profile.type = 'module';
  profile.src = '/profile-bridge.js';
  document.head.appendChild(profile);
})(window, document);
