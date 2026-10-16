# Redesign outcomes

- [x] The website keeps all existing routes, simulator interactions, authentication/session checks, profile behavior, and route rewrites unchanged.
- [x] The supplied dark charcoal, cream, red-orange visual direction is applied consistently to application pages, cards, navigation, controls, focus states, and responsive layouts.
- [x] Auth pages use the same MyPnetLab visual system.
- [x] MyPnetLab branding is replaced with MyPnetLab in visible copy, metadata, SEO snapshots, and old brand/domain references.
- [x] Static validation passes and the production Vercel deployment is ready.

## FortiGate simulator DHCP server

- [x] Add a per-interface DHCP server toggle and basic scope fields.
- [x] Integrate FortiGate scopes with the shared DHCP lease service for directly connected and same-VLAN clients.
- [x] Validate direct-link and VLAN client leases, sequential pool allocation, and service cleanup when disabled.

## Login-first entry

- [x] Unauthenticated visits to `/` show login first; the login page offers a signup option below the form for account creation, while existing sessions and auth flows continue to work.
- [x] Use the supplied `PlayfulNetworkLearningDoodleWallpaper.png` as a responsive login-page background and keep the login form legible on desktop and mobile.
