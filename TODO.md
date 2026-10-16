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
- [x] Replace the login page’s text brand link with the supplied logo image at a small responsive size, preserving its home link and accessible alt text.
- [x] Use the same supplied logo and network-learning background on `/register` and `/forgot-password` as on `/login`, preserving their existing account-creation and password-reset form behavior.
- [x] After successful login, show visible loading feedback instead of a blank screen while the session is verified and the React app mounts; keep protected content hidden until both are ready, and provide a safe sign-in/reload fallback if startup stalls.

## Startup performance

- [x] Avoid downloading the simulator app bundle for unauthenticated root visits; start it only when a cached or verified Supabase session exists, defer profile sync until after auth passes, and use a preloaded WebP auth wallpaper.

## App navbar brand

- [x] Replace the visible MyPnetLab wordmark in the app home link with the supplied logo image while preserving the home destination, responsive sizing, and accessible name.
