# MyPnetLab visual redesign

## Direction
- Preserve all existing routes, simulator behavior, auth/session behavior, menu interactions, and compiled application logic.
- Replace the previous MyPnetLab branding with MyPnetLab across HTML metadata, visible copy, SEO snapshots, and public URLs where the old brand/domain appears.
- Apply a dark editorial learning-platform system inspired by the supplied reference: near-black canvas, charcoal panels, cream typography, red-orange action color, restrained rounded corners, thin borders, and high-contrast course/progress cards.
- Use a safe CSS theme layer loaded after the compiled app styles so behavior and route code remain unchanged.

## Design system
- Palette: `#11100f` canvas, `#1b1918` surface, `#272321` elevated surface, `#f4efe9` text, `#a79d95` muted text, `#f05235` primary accent, `#ff8a5b` accent highlight.
- Typography: system UI fallback with a compact display weight for headings and readable neutral body text.
- Layout: editorial shell with stronger section separation, large high-contrast headings, orange action emphasis, and compact learning cards.
- Interactions: preserve existing targets and handlers; restyle hover/focus states only.

## Implementation
- `assets/mypnetlab-theme.css` is the shared visual layer for application pages.
- `auth.css` receives the matching auth-page treatment.
- `profile-bridge.js` remains behavior-only and continues to support the existing Supabase profile integration.
- Branding replacements are limited to tracked text/metadata assets and do not change application data or route identifiers.

## Authentication entry and login presentation
- Unauthenticated visits to `/` open `/login` first; an existing valid session continues to the application without an unnecessary second sign-in.
- Keep the existing `/register` account-creation flow and expose it directly below the login form for visitors who do not have an account.
- Use the supplied network-learning illustration as a responsive login-only background, keeping the form readable and preserving the existing Supabase auth handlers.
