# Surgeventa — Social Platform Integrations Research & Status

This document records verified official developer API requirements, OAuth constraints, account eligibility, app review gates, rate/quota limits, and zero-spending compliance for all 9 target platforms.

**Policy:** Surgeventa uses official APIs only. Where a platform has discontinued free automated publishing or closed open self-serve API registration, Surgeventa implements an honest **Assisted Publishing** workflow (validated caption + media preparation + deep-link handoff) rather than breaking the zero-spend rule or scraping private APIs.

---

## Summary Matrix

| Platform | Official API | Default Mode (Zero-Spend) | Personal Account Direct Publish? | Free API Cost | Review / Audit Gate | Implementation Status |
| --- | --- | --- | --- | --- | --- | --- |
| **YouTube** | YouTube Data API v3 | Direct API | Yes | Free | OAuth verification + compliance audit for public uploads | Planned (M4) |
| **LinkedIn** | Share on LinkedIn / Marketing API | Direct API | Yes | Free | Self-serve for personal (`w_member_social`); review for Org Pages | Planned (M4) |
| **Threads** | Meta Threads API | Direct API | Yes | Free | Meta App Review for external users | Planned (M4) |
| **Facebook** | Meta Graph API (Pages) | Direct API | **No** (Pages only) | Free | Meta App Review + Business Verification | Planned (M6) |
| **Instagram** | Instagram Graph API | Direct API | **No** (Business/Creator only) | Free | Meta App Review + Business Verification | Planned (M6) |
| **Pinterest** | Pinterest API v5 | Direct API | Yes | Free | Trial = private pins; Standard = free video demo review | Planned (M6) |
| **TikTok** | TikTok Content Posting API | Direct API | Yes | Free | Unaudited = `SELF_ONLY` (private); public requires audit | Planned (M6) |
| **X** | X API v2 | **Assisted Manual** | Yes (via handoff) | **Paid** (pay-per-use credits) | Free tier discontinued | Planned Assisted (M4) |
| **Reddit** | Reddit Data API | **Assisted Manual** | Yes (via handoff) | Restricted free | Self-serve registration closed; approval required | Planned Assisted (M4) |

---

## Platform-by-Platform Details

### 1. YouTube (`youtube`)
- **Official API:** YouTube Data API v3 (`videos.insert`).
- **OAuth & Scopes:** Google OAuth 2.0 (`https://www.googleapis.com/auth/youtube.upload`, `youtube.readonly`).
- **Account Eligibility:** Any Google account with an active YouTube channel.
- **Review / Audit:** Projects created in Google Cloud default to uploading videos locked as `private` until the app completes Google's OAuth verification & YouTube API Services compliance audit (free).
- **Quotas & Limits:** Free `10,000` quota units/day per Google Cloud project (no paid upgrade tier; quota increases require compliance audit).
- **Limitations:** Video/Shorts publishing only; Community text/image posts are not supported via official API.

### 2. LinkedIn (`linkedin`)
- **Official API:** LinkedIn Posts / Share API.
- **OAuth & Scopes:** OAuth 2.0 (`openid`, `profile`, `w_member_social` for personal profiles).
- **Account Eligibility:** Personal profiles work via self-serve *Share on LinkedIn*. Organization Pages require admin permissions plus approval for the *Community Management API*.
- **Quotas & Limits:** Free; subject to daily member-level and app-level throttling (HTTP 429).
- **Limitations:** Personal profile analytics are heavily restricted; no official API exists for automated outreach/DMs.

### 3. Threads (`threads`)
- **Official API:** Meta Threads API (container create -> publish two-step flow).
- **OAuth & Scopes:** Meta OAuth (`threads_basic`, `threads_content_publish`, optional `threads_manage_insights`). Long-lived user tokens expire after 60 days and must be refreshed.
- **Account Eligibility:** Eligible Threads profiles (personal/creator).
- **Review / Audit:** Owner/test roles work in development mode; external users require Meta App Review.
- **Quotas & Limits:** Free; up to `250` API-published posts and `1,000` replies per rolling 24 hours.
- **Limitations:** Image/video publishing requires publicly reachable HTTPS media URLs for Meta's servers to fetch.

### 4. Facebook (`facebook`)
- **Official API:** Meta Graph API (Pages).
- **OAuth & Scopes:** Facebook Login for Business (`pages_show_list`, `pages_read_engagement`, `pages_manage_posts`).
- **Account Eligibility:** **Facebook Pages only.** Personal profile posting is not supported by Meta's official API, and Facebook Groups API publishing was deprecated.
- **Review / Audit:** Meta App Review + Business Verification required for users outside developer roles.
- **Quotas & Limits:** Free; conservative per-Page daily publishing thresholds (~25+ posts/day).

### 5. Instagram (`instagram`)
- **Official API:** Instagram Graph API (media container create -> publish flow).
- **OAuth & Scopes:** Meta OAuth (`instagram_basic`, `instagram_content_publish`, `pages_show_list` where linked).
- **Account Eligibility:** **Instagram Business or Creator accounts only.** Personal Instagram accounts cannot publish via API.
- **Review / Audit:** Meta App Review + Business Verification for external users.
- **Quotas & Limits:** Free; up to `100` API-published posts per rolling 24-hour window (carousels count as 1 post); `200` calls/hour/account.
- **Limitations:** No text-only posts; requires publicly accessible HTTPS media URLs.

### 6. Pinterest (`pinterest`)
- **Official API:** Pinterest API v5 (`POST /v5/pins`).
- **OAuth & Scopes:** OAuth 2.0 (`boards:read`, `pins:read`, `pins:write`, `user_accounts:read`).
- **Account Eligibility:** Pinterest accounts (Business account recommended for analytics).
- **Review / Audit:** New apps receive **Trial Access** (free, `1,000` requests/day, pins visible only to the creator). Upgrading to **Standard Access** for public pins is free and requires submitting a video demo of the OAuth + Pin creation flow.
- **Limitations:** Every Pin requires media (image or video) and a target Board ID.

### 7. TikTok (`tiktok`)
- **Official API:** TikTok Content Posting API (Direct Post / Inbox Upload).
- **OAuth & Scopes:** TikTok Login Kit + Content Posting (`user.info.basic`, `video.publish` / `video.upload`).
- **Account Eligibility:** TikTok creator or business accounts.
- **Review / Audit:** Unaudited apps are strictly capped at `5` users per 24 hours and can only publish private (`SELF_ONLY`) posts. Public Direct Post requires passing TikTok's free developer audit, including mandatory UX disclosures (privacy selector, comment/duet/stitch controls, commercial content toggles).
- **Quotas & Limits:** Free; ~`15` posts/day per creator account; `6` upload starts/minute.

### 8. X / formerly Twitter (`x`) — Assisted Publishing Default
- **Official API:** X API v2.
- **Pricing Reality (Verified 2026):** The traditional free publishing tier has been **discontinued**. X API v2 operates on a **pay-per-use credit model** (`$0.015` per post creation, `$0.20` per post containing a URL).
- **Surgeventa Strategy:** To uphold the non-negotiable `$0` spending constraint, X defaults to an **Assisted Publishing workflow** (caption length validation at 280 chars, media validation, one-click copy/download, and pre-filled intent URL handoff). Direct API code will only be enabled if the user explicitly opts in and funds X API credits in the future.

### 9. Reddit (`reddit`) — Assisted Publishing Default
- **Official API:** Reddit Data API.
- **Access Reality (Verified 2026):** Reddit closed open self-serve public API client registration; free API access (`100 QPM`) is restricted to pre-approved non-commercial and moderation applications, while commercial/scaling access requires private enterprise agreements.
- **Surgeventa Strategy:** Default to an **Assisted Publishing workflow** (subreddit target notes, title/body validation, flair reminders, and direct submit-page handoff). Optional direct OAuth adapter can be plugged in only if the user holds an approved official non-commercial client ID.
