# Audience Verdict Complete Project Update Report

## Local backend address update (2026-11-03)

- Updated ignored `.env.local` so local development uses the same-origin `/api/v1` base and Vite forwards requests to `http://192.168.29.53:8080/api/v1`. Social Operator calls continue through `/api/v1/social/...`.
- Historical routing investigation below records the former `.41` address; use `.53` for current local network access.
- Local API requests now use Vite's same-origin `/api/v1` development proxy to `192.168.29.53:8080`, avoiding browser CORS preflight requirements. This requires restarting Vite after `.env.local` or Vite configuration changes.

## Admin portal refinement from supplied Operator OpenAPI document

- The gateway route table is the source for frontend URLs: service operations such as `/api/videos` map to gateway `/api/v1/social/videos`; the frontend's centralized social base is `${API_BASE_URL}/social` and strips the Operator-only `/api` prefix.
- Comment inbox filters now use the documented `platform`, local `accountId`, `videoId`, `needsReply`, `afterId`, and `limit` query parameters. Cursor navigation uses the last local comment ID.
- Reply handling follows the documented states: only `FAILED` jobs can be retried; `UNKNOWN` jobs require explicit confirmation after checking the provider. The UI states that queue acceptance is not delivery confirmation.
- Removed unsupported sidebar entries for persisted content library, calendar, scheduled posts, and separate publishing modes because the supplied API has no listing/scheduling endpoints for them. Existing publishing actions now use the documented TEXT/IMAGE/VIDEO and draft fields.
- Removed the movie filter from application videos because `ApplicationVideo` and `CreateVideo` expose no movie identifier or relation. Overview labels identify returned/paginated counts rather than claiming totals.
- The comment inbox now has account and application-video selectors, all/needs-reply/has-reply filters, and local resolved/unresolved filters. Mutations refresh the affected data; assignment operations reload the source video uploads.
- Analytics includes account, upload, and application-video current tasks and historical snapshots, with platform identifiers and provider result JSON kept separate. It does not build charts because metric result values are provider-specific JSON and no universal numeric series is defined in the schema.

## Social Media Operator routing follow-up (2026-11-02)

### Confirmed backend integration path

- User confirmed the working Audience backend route `http://192.168.29.41:8080/api/v1/social/comment-replies/{id}`.
- The supplied gateway route document identifies `config-repo/api-gateway.yml` as the route source, with Config Server and Eureka discovery. It explicitly lists social routes under `/api/v1/social/...` and states route updates load on gateway restart; for the native Config Server setup it instructs rebuilding/restarting `api-gateway` to remove old Java routes.
- Unauthenticated probes to `http://192.168.29.41:8080/api/v1/social/comment-replies/test` and `/api/v1/social/videos` return 401, confirming those paths are registered behind authentication.
- The Operator API service remains at port 8085 with OpenAPI base `http://192.168.29.41:8085` and routes such as `/api/videos`. The Audience backend's `/api/v1/social/...` is the gateway path intended for the frontend.
- Unauthenticated production requests to `https://api.audienceverdict.in/api/v1/social/videos` returned 404, despite the documented gateway route and internal 401 behavior. This points to production using stale or incomplete Config Server/gateway route configuration. Production browser integration must be verified after the documented gateway rebuild/restart.

### Frontend changes

- `src/services/config.ts` now derives `SOCIAL_API_BASE_URL` from the existing `API_BASE_URL`, appending `/social`.
- `src/services/socialMedia.ts` maps Operator operation paths such as `/api/videos` to the Audience backend path `/api/v1/social/videos`; reply retrieval maps to `/api/v1/social/comment-replies/{id}`. The existing JWT is sent on requests.
- Removed the separate Social Operator origin env setting and the temporary Vite proxy. `.env.local` uses the network backend at `:8080/api/v1`, so local frontend requests stay on the Audience backend origin and use its authentication/CORS handling.
- Production `VITE_API_BASE_URL` remains `https://api.audienceverdict.in/api/v1`; production therefore requests `https://api.audienceverdict.in/api/v1/social/...`, not the old `/api/videos` path.

### Verification status

| Check | Status | Result |
|---|---|---|
| Internal Audience backend social route | PARTIAL | Unauthenticated route probes return 401, showing auth middleware recognizes the paths. Authenticated response/schema not tested. |
| Internal Operator API | PARTIAL | OpenAPI and service respond on port 8085; endpoint requires JWT. |
| Previous production `/api/videos` route | FAIL | User screenshot shows Caddy 404. Frontend no longer calls this route. |
| Production `/api/v1/social/...` route | FAIL | Documented route returns 404 in production while the internal gateway returns 401, indicating production route configuration has not caught up. |
| No internal IP in production frontend bundle | PASS | Production API base remains the public HTTPS API host. |
| JWT and comment allowlist | BLOCKED | No test JWT or safe allowlist fixture. |
| Write and regression workflows | BLOCKED | No authenticated isolated fixtures; no writes were attempted. |

**Deployment action from the supplied gateway notes:** update the active Config Server source (`config-repo/api-gateway.yml`, or the packaged/Git equivalent), rebuild and restart `api-gateway` as documented, and wait for Eureka downstream registration. Then verify `/api/v1/social/videos` and other operations with an administrator JWT. Gateway configuration source is not present in this frontend checkout, so the server-side deploy was not performed here.
## Existing project architecture and integration status

## Architecture map

- **Frontend:** React 19, TypeScript, Vite, React Router 7, handwritten CSS, Lucide icons.
- **Audience routes:** existing home, movie catalogue/details, reviews, login/profile, bookings and ticket flows in `src/pages/Public.tsx` and `src/pages/User.tsx`.
- **Admin routes:** existing protected `/admin` shell and catalogue, venue, show, booking, QR, waitlist, notification, audience, review and settings pages.
- **Authentication:** existing `/api/v1` backend OTP/JWT flow. Operator pages are nested under `ProtectedRoute adminOnly` and send the existing access JWT.
- **Backend source:** not present in this workspace. README references a sibling backend that is unavailable here.
- **Social API:** live OpenAPI 3.1 document for Social Media Operator API 1.0.0 was fetched at `http://192.168.29.41:8085/v3/api-docs`. It requires bearer JWT; comment actions additionally enforce subject-keyed account allowlists.
- **OAuth:** no OAuth implementation or connected-account workflow is present in this frontend checkout. Operator account records are shown separately; no OAuth controls or token handling were added.
- **Data model:** frontend movie entities have no application-video relation. Operator `ApplicationVideo`, numeric local `Upload`, `Account`, `Comment`, `Publication` and `SavedContent` are modeled separately in the new service.

## Changes made

- Added protected Social Media Operations navigation and routes while preserving existing modules.
- Added typed Operator API services using the existing API base, request handling, and session JWT. Multipart requests preserve the browser-generated boundary; binary media retrieval uses the same client.
- Added account records, application video list/create/details, unassigned upload filtering and assignment, linked upload reassignment/unlink, assignment audit, comment inbox/thread/reply management, comment sync/reset, multipart content create/draft/publish/retry/media retrieval, and account/upload/video current and historical metrics.
- Added responsive styles for the social operations surfaces.
- Fixed two shared-service regressions found while running the existing suite: legacy movie serialization and unsafe acceptance of lookalike embed hosts.
- No backend, database, deployment configuration or audience business workflows were changed.

## Capability status

| Area | Status | Detail |
|---|---|---|
| Existing portal routes and auth boundary | PARTIAL | Social pages are inside the existing admin-only frontend route and use the established JWT client. Backend authorization has not been exercised. |
| Operator API contract inspection | PASS | Live OpenAPI paths, schemas, request content types, auth and response shapes were inspected. |
| Application video create/list | PARTIAL | Uses documented `CreateVideo` fields, list/detail/create APIs and linked upload detail. No authenticated write was made. Movie association is absent from the Operator schema. |
| Upload assignment/reassignment/unlink | PARTIAL | Assign, target-aware reassign, and unlink use local upload IDs and confirmation; not verified against an authorized account. |
| Assignment audit and sync | PARTIAL | Audit/sync retrieval and reset controls are wired; no actual records or reset result verified. |
| Operator accounts | PARTIAL | Displays Operator `Account` records. This does not establish OAuth connection, permissions, profile image, or reconnect state. |
| OAuth reuse and account mapping | BLOCKED | Backend source and verified identifier mapping are unavailable. No OAuth flow or token storage was duplicated. |
| Content creation/publishing | PARTIAL | Multipart create supports TEXT/IMAGE/VIDEO, draft flag and YouTube privacy; publish and failed publication retry are wired. No publication was initiated or confirmed. Persisted content-library listing is not defined in the exposed paths. |
| Comments and resolution | PARTIAL | Inbox, thread, resolution and reply job actions are wired; account allowlist behavior has not been verified. |
| Reply delivery reconciliation | PARTIAL | Thread jobs, retry, uncertain confirmation and queued responses are represented. No reply was sent or delivery result confirmed. |
| Analytics | PARTIAL | Account/upload/video tasks and histories are wired, cursor paginated, and preserve per-platform provider JSON. No authenticated data was available to verify; charts are omitted because the schema does not define common numeric series. |
| Audience unified social feed/video detail | BLOCKED | Operator API is administrator-authenticated and provides no audience-safe feed route or movie-to-video mapping. Calling these endpoints from audience pages would expose privileged data. |
| Audience movie/review/profile/booking behavior | PARTIAL | Existing pages were retained and were not modified or regression-tested in this update. |
| QR/mobile verification | PARTIAL | Existing QR scanner module remains in the project; no QR/mobile implementation changes were made. |
| AI sentiment and Social Media Manager Portal | NOT IMPLEMENTED | Deferred by the brief. |

## Verification

- **Build:** PASS. `npm.cmd run build` completed. Vite reports a large JavaScript chunk warning.
- **OpenAPI:** PASS. Live specification and the relevant video, upload, content, publishing, comment, reply, assignment, sync, account and metric schemas were fetched.
- **Tests:** PASS. `npm.cmd test` completed with 5 test files and 25/25 tests passing, including authentication, booking, movie service, and page regression coverage.
- **Live API check:** BLOCKED. The Operator API at `192.168.29.41:8085/v3/api-docs` was unreachable from this execution environment. The attached OpenAPI document and prior routing investigation remain the contract basis. No write calls or production operations were made.
- **Diff validation:** PASS. `git diff --check` reported no whitespace errors.
- **Live read/write workflows:** BLOCKED. No administrator token or safe operator test data was available. No publish, reply, reset, assignment or destructive action was executed.
- **OAuth/security/regr:** BLOCKED pending backend source and authorized test identities. Frontend route guarding does not replace server-side authorization.

## Remaining work

1. Provide the backend checkout/API gateway and OAuth account endpoints to validate existing OAuth reuse, account scopes, stable mapping, and server-side permissions.
2. Add or identify a safe audience-facing API for unified application videos, platform-separated metrics, public comments and replies; then connect movie records through the verified application-video relationship.
3. Add/identify a documented content-library listing API if administrators need to browse all saved content without entering an ID.
4. Run authenticated integration, permission, responsive and workflow verification with isolated fixtures; the Operator API was unreachable from this run and no administrator test token was available.

No database migrations or backend endpoints were added. Existing bookings, movie workflows, QR scanning, audience profiles and reviews were left intact. No Social Media Manager Portal was created.

## Audience Verdict Reviews engagement metrics (2026-11-05)

- The user-provided network output confirms the audience session receives HTTP 403 from `GET /api/v1/social/uploads/unassigned`. The endpoint is Operator-only for this session. Reviews therefore no longer requests Operator upload inventory, account, comment, metric-task, or history routes from the public audience page, and does not attempt to present an administrator credential there. It displays engagement only when the audience-authorized feed itself supplies metric fields or engagement metadata.
- Added and tested a strict record-matching utility: platform plus provider external content ID, using account ID/external account ID to disambiguate. Provider IDs from explicit fields, supported provider permalinks, or string feed IDs are lookup keys only; `Upload.id` is the only valid metrics `contentId`. No title-based matching is used. The utility is ready for use in an authorized backend context, but the audience page cannot call it without upload rows.
- **Backend fix required:** expose the matched local upload ID and allowed provider metrics from the existing audience portal feed, or authorize a narrowly scoped audience read path for uploads/metrics visible in that feed. Do not grant audience access to `/uploads/unassigned` or use an admin JWT in the browser. The backend service, gateway authorization config, database, OAuth sync jobs and logs are absent from this workspace, so the 403 policy and provider synchronization cannot be changed here.
- The screenshot shows six cards blocked by the same inventory 403: YouTube `AV1`, YouTube `AV` (two cards), Facebook `Audience post`, YouTube `App upload test - 1 November 2026`, and Instagram `Audience post`; the seventh post is not visible. The exact local upload IDs and provider values are not available from the evidence supplied.
- **Verification:** `npm.cmd test -- --run src/utils/socialUploadMapping.test.ts` passed 4 identity-mapping checks across YouTube, Instagram and Facebook, account disambiguation, and rejection of title-only/ambiguous matches. These use identity fixtures only, not engagement metrics. The latest `npm.cmd run build` passed. Live provider metrics, OAuth synchronization, and backend authorization remain unverified/blocked.

## Admin View Posts visual update (2026-11-05)

- Restyled Admin > Social Media Operations > View Posts to follow the Reviews page structure: cinematic hero banner, platform filter pills, search/account controls, compact refresh, platform/post selection stats, and a responsive three-column post-card grid.
- Preserved the existing upload selection, movie/AV target, audience picker, and bulk assignment actions.
- **Verification:** `npm.cmd run build` passed after the View Posts component/CSS changes. Browser preview was unavailable in this session.
