/* Public-access policy for Config by Network Kings.
 * Authentication and subscription gates are intentionally disabled.
 * Keep this as the single source of truth for pages and the application bundle.
 */
(function (window) {
  'use strict';

  var policy = Object.freeze({
    authenticationRequired: false,
    authMode: 'public',
    defaultPlan: 'CONFIG PRO',
    planKey: 'config-pro',
    courseAccess: 'all',
    allCoursesEnabled: true,
    trialRequired: false
  });

  window.CONFIG_ACCESS_POLICY = policy;
  window.CONFIG_AUTH_DISABLED = true;
  window.CONFIG_DEFAULT_PLAN = policy.defaultPlan;
  window.CONFIG_HAS_FULL_COURSE_ACCESS = true;
})(window);
