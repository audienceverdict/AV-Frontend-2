# Audience Verdict frontend

React, TypeScript, Vite. Run `npm install`, then `npm run dev`; on PowerShell use `npm.cmd` if script execution is disabled. Start the backend as described in [../backend/README.md](../backend/README.md).

Authentication uses the shared `/auth/otp` endpoints. New accounts verify email, provide a name and mobile, then verify the mobile by WhatsApp before registration. Returning users sign in with email OTP only. The token lives in sessionStorage for reloads within the tab; the user/role are loaded from the backend. Invalid/expired tokens clear the session. There is no fixed OTP or hardcoded admin number.

## Frontend audit (2026-10-03)

### Architecture and source tree

```text
frontend/
├── index.html                 Vite HTML entry, title and metadata
├── vite.config.ts             React plugin and /api -> configured backend proxy
├── package.json               scripts and React/Router/Lucide dependencies
├── public/                    static files
├── videos and photos/         supplied video, photo and PDF references
└── src/
    ├── main.tsx               React root, LoadingScreen, global CSS imports
    ├── App.tsx                 AppProvider, BrowserRouter, route tree, ScrollTop
    ├── types.ts                Movie, Theatre, Screen, Show, Booking, Review, Data
    ├── styles.css              global dark theme and responsive component styles
    ├── brand-images.css        brand mosaic and hero brand mark styles
    ├── venue-setup.css         venue setup and layout editor styles
    ├── context/AppContext.tsx  shared catalogue, user, admin and auth state
    ├── components/
    │   ├── Common.tsx          Layout/header/footer, Logo, Poster, MovieCard,
    │   │                       SectionHeading, ReviewCard, Modal, Video, Notice
    │   ├── LoadingScreen.tsx   application loading wrapper
    │   └── TheatrePicker.tsx   venue selection/location component
    ├── pages/
    │   ├── Public.tsx          home, movies, movie detail, about
    │   ├── User.tsx            auth, bookings, tickets, profile, reviews
    │   ├── BookMyShow.tsx      movie show/seats/booking flow
    │   ├── Admin.tsx           admin workspace and management pages
    │   ├── VenueSetup.tsx      venue configuration
    │   ├── ScreenWorkspace.tsx screen layout management
    │   ├── LayoutBuilder.tsx   reusable seat layout editor
    │   ├── AuthFlow.test.tsx   auth UI tests
    │   └── ...                 page modules above also hold their page logic
    ├── services/
    │   ├── api.ts              backend catalogue calls and local demo repository
    │   ├── auth.ts             OTP/JWT/profile/admin user APIs
    │   ├── api.test.ts         repository and booking tests
    │   └── auth.test.ts        auth API tests
    └── data/
        ├── seed.ts             browser demo catalogue and related sample records
        └── brandImages.ts      brand image URLs
```

Framework: React 19 + TypeScript. Build/dev tool: Vite 6. Routing: React Router 7. Icons: lucide-react. Styling is hand-written CSS (no Tailwind/SCSS); fonts are DM Sans and Manrope via Google Fonts. Dark charcoal palette, coral accent, rounded cards, gradients, transitions, and reduced-motion rules. API requests use the shared `VITE_API_BASE_URL` setting (see `.env.example` and `.env.production`); machine-specific `.env.local` overrides are ignored by Git. Vite embeds these values at build time. Posters/backdrops and some brand images are remote URLs; video/PDF references are in `videos and photos/`. No dedicated hooks directory or reusable carousel exists.

### Routes and page behavior

Every public route uses the shared `Layout` with header, navigation, main content and footer. The admin tree is a protected standalone workspace.

| Route | Page / purpose | Auth | Main behavior, dependencies and states |
|---|---|---|---|
| `/` | `Home` | No | Hero, spotlight movie cards, concept panel, featured reviews/videos, how-it-works, join banner. Uses shared movie/review data; empty movie/review states. Responsive global CSS. |
| `/movies` | `Movies` | No | Search, genre/language/status/sort filters and movie grid; clear-filters empty state. |
| `/movie/:movieId` | `MovieDetails` | No | Poster, metadata, description, booking/review/trailer links, audience rating bars, reviews; not-found state. |
| `/movie/:movieId/book` | `BookMyShow` | User | Theatre/date/show/seat selection, booking summary and simulated payment/confirmation; protected route redirects to login. |
| `/movie/:movieId/reviews` | `Reviews` | No to read; login to write | Movie-filtered reviews and review form; submission uses review repository and pending state. |
| `/reviews` | `Reviews` | No to read; login to write | Tabs, movie filter, written/video review cards; empty state. |
| `/audience-verdict`, `/about` | `About` | No | Brand explanation, audience value cards, how-it-works and prototype note. |
| `/login`, `/verify-otp` | `Login` | No | Returning users sign in with email OTP; new users verify email and WhatsApp OTP before account creation. |
| `/my-bookings` | `Bookings` | User | Current-user bookings, cancel action, ticket links, empty state. Booking data is demo repository-backed. |
| `/booking/:bookingId` | `DigitalTicket` | User/admin | Confirmation, ticket details, download/print; missing/unauthorized ticket empty state. |
| `/profile` | `Profile` | User | Profile update through backend auth service. |
| `/admin` | `Dashboard` | Admin | Catalogue/booking statistics and recent activity. |
| `/admin/venues` | `VenueSetup` | Admin | Create/edit venues and screens; backend repository/API for catalogue entities. |
| `/admin/venues/:venueId/screens/:screenId` | `ScreenWorkspace` | Admin | Screen seating layout management and version operations. |
| `/admin/shows/:showId` | `ShowWorkspace` | Admin | Show details/workspace management. |
| `/admin/movies`, `/admin/theatres`, `/admin/screens`, `/admin/shows`, `/admin/reviews` | `Manage` | Admin | Search/manage corresponding catalogue entities, editor links and delete/save actions. |
| `/admin/movies/new`, `/admin/movies/:id/edit` | `MovieEditor` | Admin | Movie form and persistence through movie repository. |
| `/admin/bookings` | `AdminBookings` | Admin | Booking list and admin booking actions. |
| `/admin/audience` | `Audience` | Admin | User/audience administration via authenticated admin API. |
| `/admin/settings` | `AdminSettings` | Admin | Local demo booking confirmation setting and prototype notes. |
| `*` | `Empty` fallback | No | Out-of-frame message and home link. |

The shared header links Home, Movies, Audience Verdict, Reviews, About, conditional My Bookings, login/profile, and a mobile menu. Footer links movies/reviews/admin. `ScrollTop` resets scroll on route change. Forms expose validation/error notices; common empty states use `Empty`; the provider initializes with empty data and resolves backend/auth state.

### Landing page, top to bottom

1. **Header** (in shared `Layout`): AV monogram/wordmark; Home, Movies, Audience Verdict, Reviews, About; Hyderabad label; Login or profile button; mobile menu. No register button; OTP registration is inside login.
2. **Hero**: current background uses active movie `backdropUrl` or falls back to its poster, set as cover background. Brand mosaic/brand mark elements are present but hidden by `brand-images.css`. Before the requested hero update it showed the marketing kicker/headline/copy, Explore Movies and Audience Verdict buttons, community avatars, featured movie detail/trailer button and decorative pagination. The hero has a left-aligned brand kicker, headline, supporting copy and actions; a poster slideshow sits on the right over the hero artwork. The active movie backdrop and poster change together. The old spotlight info box is removed. Image URLs are remote; poster uses lazy loading through `Poster`.
3. **Value strip**: three icon/value statements about honest opinions, tickets, and audience voice.
4. **In the spotlight**: section heading and up to five `MovieCard`s; links to all movies; empty state when no movies exist.
5. **Concept panel**: AV orbit artwork and Audience Verdict explanation/link.
6. **Real voices**: up to three highlighted approved reviews plus highlighted approved video reviews when present.
7. **How it works**: five steps from finding a film through sharing a verdict.
8. **Join banner**: movie discovery CTA.
9. **Footer**: shared links, brand copy, copyright and demo disclosure.

Hero dimensions are responsive (base rules plus landing overrides, with breakpoints at 900px and 680px). The main backdrop uses cover positioning and gradients. Text and action buttons animate on entry/hover, with reduced-motion support. The desktop/tablet/mobile pixel widths requested in the brief have not been browser-automated.

### Movie data and “newest” meaning

`Movie` in `src/types.ts` contains `id`, `title`, `posterUrl`, optional `backdropUrl`, `trailerUrl`, `description`, `genre[]`, `language`, `duration`, `releaseDate`, `certification`, `director`, `cast[]`, `production`, and `status` (`UPCOMING | ACTIVE | ENDED`). There is no `createdAt`/added timestamp, booking field, theatre or showtime field on Movie. Shows, theatres, screens and bookings have separate interfaces and IDs.

On app startup `AppContext` calls `loadBackendData()`; movie records come from `GET /api/v1/movies?size=200` (`content` page field). The same loader populates theatres, shows, reviews, bookings and theatre screens. `database` normalizes and stores the current catalogue in an in-memory Map adapter; `seed.ts` contains browser demo sample records used by repository tests, but startup removes the prior local demo data and loads backend data. Thus runtime catalogue is backend-sourced when available. Home reverses the returned movie order and uses the first four as its “Just added” list; this treats backend/list order as newest, because the model provides no creation timestamp. No fake records are added.

### API calls and backend boundaries

All auth and catalogue requests use `/api/v1`; Vite proxies `/api` to port 8080. Auth tokens are read from local/session storage and sent as Bearer tokens. Backend JSON errors are mapped to notices or provider auth error state; catalogue load is settled per resource so failed resources become empty lists.

| Endpoint(s) | Method | Use / payload |
|---|---|---|
| `/auth/otp/request`, `/auth/otp/verify` | POST | Login OTP uses `{destination}` and `{destination,otp}`; `destination` is the existing account email. |
| `/auth/otp/registration/request`, `/verify` | POST | WhatsApp registration OTP uses `{destination}` and `{destination,otp}`; verification returns a mobile `registrationToken`. Only new mobile numbers can request this OTP. |
| `/auth/otp/registration/email/request`, `/verify` | POST | Email registration OTP uses `{registrationToken,email}` and `{registrationToken,email,otp}`; verification returns an email proof token. |
| `/auth/me` | GET, PUT | Restore/current user; PUT `{name,email|null}` for profile. |
| `/auth/otp/register` | POST | `{email,name,mobile,registrationToken,emailVerificationToken}` after both verifications. |
| `/admin/users?page=…&size=20` | GET | Admin audience pages. |
| `/admin/users/:id/role`, `/status` | PATCH | `{role}` or `{enabled}`. |
| `/movies?size=200`, `/theatres?size=200` | GET | Paged catalogue; loader reads `content`. |
| `/shows`, `/reviews` | GET | Catalogue arrays. |
| `/bookings/admin`, `/bookings/me` | GET | Admin/current booking data; loader prefers admin result if successful and maps booking snapshot fields. |
| `/theatres/:id/screens` | GET, POST | Load or create screen; seat shape normalized between rowNumber/columnNumber and row/column. |
| `/{movies,theatres,shows,reviews}/:id` and collection roots | GET/PUT/POST/DELETE as applicable | Repository save/delete; shows normalize booking windows and seatPrices. |
| `/theatres/screens/:id` | PUT/DELETE; `/theatres/screens/:id/layout-versions` | Update/delete screen, list/save layout versions. Save version uses query name/sourceVersionId. |
| `/bookings/admin/:id/confirm`, `/cancel`, `/attendance?attended=` | POST | Admin confirm, `{reason}` cancel, attendance toggle. |

Auth also posts JSON and clears stale tokens on 401. Booking creation, cancellation and payment are handled by frontend demo repository/simulation code; no real payment provider is called. Geolocation reverse lookup in `BookMyShow` calls external Nominatim GET with lat/lon. Review and some catalogue persistence are currently frontend/local repository paths; actual backend support depends on endpoints in the integration. No backend APIs were changed by this frontend task.

### Existing booking flow

Movie card or Movies page → `/movie/:movieId` → **Book Ticket** → `/movie/:movieId/book` (existing `BookMyShow`, behind `ProtectedRoute`) → theatre/date/show selection → seats → booking summary → simulated payment (`mockPaymentService`) and booking persistence (`createBooking`) → `/booking/:bookingId` digital ticket. Existing show/ticket state and theatre/screen/seat data are joined by IDs. A signed-out visitor reaches login with a return path; successful auth returns to the protected booking page. Existing demo flow does not take real payment. The landing Book Ticket button targets the active slideshow movie at `/movie/:id/book`; it does not add a new route.

### Reuse, scope, and implementation record

Reuse: `MovieCard` for catalogue cards, app context for backend-loaded movies, existing `/movie/:id/book` booking route, `Modal`/`Video` for trailer, global color/type/button tokens and reduced-motion rules. No hero carousel is used.

Files changed for hero: `src/pages/Public.tsx` and `src/styles.css`. This report is added to `README.md`. No backend source, route table, type, service/API, auth, booking page, shared components, seed data, or other page was modified for the hero.

Current hero: retain the specified headline and supporting copy, remove the spotlight info box, and show up to four movie posters in a timed/manual slideshow over the existing hero background. The poster and backdrop switch to the same movie; Book Ticket uses the existing movie booking route.

Quality checks: source and route/API paths were inspected. This audit does not claim browser verification at the requested viewport sizes, console inspection, or build/test execution. Remaining data limitation: exact creation-time ordering needs a movie-added timestamp from the existing backend/data model; the frontend deliberately reuses returned order until that field exists.

`src/services/auth.ts` implements the API adapter. `src/context/AppContext.tsx` restores authentication before protected pages render. Vite proxies `/api` to port 8080 during development. On the production server, route `/api` to the backend and configure the web server to serve `index.html` for frontend routes (SPA fallback).

`npm test` and `npm run build` run validation.

Movies, theatres, layouts, shows, reviews, bookings and settings still use localStorage demo repositories in `src/services/api.ts`. Payments, booking notifications and ticket QR visuals remain simulations. Existing browser demo users/bookings are not migrated into backend accounts. Real auth UUIDs are separate from seeded demo identities. The frontend admin catalogue controls are not a substitute for backend authorization on those future modules.
"# AV-Frontend-2" 
