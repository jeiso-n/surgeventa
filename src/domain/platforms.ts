export type PlatformId =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "reddit"
  | "pinterest"
  | "linkedin"
  | "x"
  | "threads";

export type PublishingMode = "direct_api" | "assisted_manual";

export type IntegrationStatus =
  | "planned_direct"
  | "planned_assisted"
  | "connected_direct"
  | "connected_assisted";

export type MediaType = "text" | "image" | "video" | "carousel" | "link";

export interface PlatformCapability {
  id: PlatformId;
  name: string;
  apiName: string;
  publishingMode: PublishingMode;
  implementationStatus: IntegrationStatus;
  zeroSpendCompatible: boolean;
  personalAccountSupported: boolean;
  approvalRequirement: string;
  accountEligibility: string;
  rateOrQuotaSummary: string;
  maxCaptionLength: number;
  supportedMedia: readonly MediaType[];
  analyticsSupported: "official_limited" | "unavailable_in_free_tier";
  limitationsSummary: string;
}

/**
 * Authoritative registry of Surgeventa's 9 target platforms and their verified
 * free-tier / zero-spending publishing constraints.
 *
 * Never misrepresent an integration as active or automated when official free
 * API access is unavailable, gated by pay-per-use billing, or not yet built.
 */
export const TARGET_PLATFORMS: readonly PlatformCapability[] = [
  {
    id: "youtube",
    name: "YouTube",
    apiName: "YouTube Data API v3",
    publishingMode: "direct_api",
    implementationStatus: "planned_direct",
    zeroSpendCompatible: true,
    personalAccountSupported: true,
    approvalRequirement:
      "Google Cloud OAuth verification required for public external users; unverified projects upload as private until audited.",
    accountEligibility: "Any Google account with a YouTube channel.",
    rateOrQuotaSummary: "10,000 free quota units/day; video uploads budgeted per daily quota.",
    maxCaptionLength: 5000,
    supportedMedia: ["video"],
    analyticsSupported: "official_limited",
    limitationsSummary:
      "Video-focused (including Shorts). Community text/image posts are not available via the official API.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    apiName: "LinkedIn Marketing / Share API",
    publishingMode: "direct_api",
    implementationStatus: "planned_direct",
    zeroSpendCompatible: true,
    personalAccountSupported: true,
    approvalRequirement:
      "Self-serve 'Share on LinkedIn' (w_member_social) for personal profiles; Company Pages require Community Management API approval.",
    accountEligibility: "Personal LinkedIn profile; Organization Pages require admin role + approved product.",
    rateOrQuotaSummary: "Free self-serve product with member and app daily throttling.",
    maxCaptionLength: 3000,
    supportedMedia: ["text", "image", "video", "link"],
    analyticsSupported: "official_limited",
    limitationsSummary:
      "Personal profile analytics are restricted; full engagement metrics require approved Organization/Community Management access.",
  },
  {
    id: "threads",
    name: "Threads",
    apiName: "Meta Threads API",
    publishingMode: "direct_api",
    implementationStatus: "planned_direct",
    zeroSpendCompatible: true,
    personalAccountSupported: true,
    approvalRequirement:
      "Meta Developer App with Threads use case; Meta App Review required for users outside app test roles.",
    accountEligibility: "Public or eligible Threads profile linked to Meta login.",
    rateOrQuotaSummary: "Free; up to 250 API-published posts and 1,000 replies per rolling 24h.",
    maxCaptionLength: 500,
    supportedMedia: ["text", "image", "video", "carousel"],
    analyticsSupported: "official_limited",
    limitationsSummary:
      "Requires publicly reachable media URLs during container creation; long-lived user tokens expire after 60 days and must be refreshed.",
  },
  {
    id: "facebook",
    name: "Facebook",
    apiName: "Meta Graph API (Pages)",
    publishingMode: "direct_api",
    implementationStatus: "planned_direct",
    zeroSpendCompatible: true,
    personalAccountSupported: false,
    approvalRequirement:
      "Meta App Review + Business Verification for external users; dev roles work for owner testing.",
    accountEligibility: "Facebook Pages only. Personal profile publishing is not supported by Meta's official API.",
    rateOrQuotaSummary: "Free; conservative API publishing caps (~25+ posts/day per Page depending on tier).",
    maxCaptionLength: 63206,
    supportedMedia: ["text", "image", "video", "link"],
    analyticsSupported: "official_limited",
    limitationsSummary:
      "Personal Facebook profiles cannot be published to via official API. Groups API publishing was deprecated.",
  },
  {
    id: "instagram",
    name: "Instagram",
    apiName: "Instagram Graph API",
    publishingMode: "direct_api",
    implementationStatus: "planned_direct",
    zeroSpendCompatible: true,
    personalAccountSupported: false,
    approvalRequirement:
      "Meta App Review + Business Verification for external users; linked Facebook Page often required depending on login flow.",
    accountEligibility: "Instagram Business or Creator accounts only (no Personal accounts).",
    rateOrQuotaSummary: "Free; up to 100 API-published posts per rolling 24h; 200 API calls/hour.",
    maxCaptionLength: 2200,
    supportedMedia: ["image", "video", "carousel"],
    analyticsSupported: "official_limited",
    limitationsSummary:
      "No text-only posts. Media must be hosted at a publicly reachable URL when Meta fetches the container.",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    apiName: "Pinterest API v5",
    publishingMode: "direct_api",
    implementationStatus: "planned_direct",
    zeroSpendCompatible: true,
    personalAccountSupported: true,
    approvalRequirement:
      "Free Trial access creates private/creator-only pins; Standard access for public pins requires a free video demo review.",
    accountEligibility: "Pinterest account (Business account recommended for analytics).",
    rateOrQuotaSummary: "Free; Trial capped at 1,000 requests/day; Standard scales by endpoint.",
    maxCaptionLength: 500,
    supportedMedia: ["image", "video", "link"],
    analyticsSupported: "official_limited",
    limitationsSummary:
      "Pins require media (image or video) and a destination board ID. Trial mode cannot publish publicly.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    apiName: "TikTok Content Posting API",
    publishingMode: "direct_api",
    implementationStatus: "planned_direct",
    zeroSpendCompatible: true,
    personalAccountSupported: true,
    approvalRequirement:
      "Unaudited apps are restricted to SELF_ONLY (private) posts and 5 users/24h. Public Direct Post requires passing TikTok's developer audit.",
    accountEligibility: "TikTok creator or business account.",
    rateOrQuotaSummary: "Free; ~15 posts/day per creator account; 6 upload starts/minute.",
    maxCaptionLength: 2200,
    supportedMedia: ["video", "image"],
    analyticsSupported: "official_limited",
    limitationsSummary:
      "Requires explicit creator UX disclosures (privacy, comment/duet/stitch toggles) during publishing per TikTok audit guidelines.",
  },
  {
    id: "x",
    name: "X",
    apiName: "X API v2 (Pay-Per-Use — Assisted Default)",
    publishingMode: "assisted_manual",
    implementationStatus: "planned_assisted",
    zeroSpendCompatible: true,
    personalAccountSupported: true,
    approvalRequirement:
      "Free publishing tier has been discontinued in favor of pay-per-use credits ($0.015/post, $0.20/post with URL). Surgeventa uses an Assisted workflow at $0.",
    accountEligibility: "Any X account via manual composer handoff.",
    rateOrQuotaSummary: "Zero API cost via assisted handoff (official API requires paid credits).",
    maxCaptionLength: 280,
    supportedMedia: ["text", "image", "video", "link"],
    analyticsSupported: "unavailable_in_free_tier",
    limitationsSummary:
      "Automated publishing disabled by default to enforce the strict zero-spending constraint. Surgeventa validates copy/media and opens a ready-to-post handoff.",
  },
  {
    id: "reddit",
    name: "Reddit",
    apiName: "Reddit Data API (Restricted — Assisted Default)",
    publishingMode: "assisted_manual",
    implementationStatus: "planned_assisted",
    zeroSpendCompatible: true,
    personalAccountSupported: true,
    approvalRequirement:
      "Reddit closed open self-serve API registration; free access is limited to pre-approved non-commercial/moderator apps.",
    accountEligibility: "Any Reddit account via manual handoff; direct API only if user holds an approved official client ID.",
    rateOrQuotaSummary: "Zero API cost via assisted handoff (100 QPM if an approved non-commercial client exists).",
    maxCaptionLength: 40000,
    supportedMedia: ["text", "image", "video", "link"],
    analyticsSupported: "unavailable_in_free_tier",
    limitationsSummary:
      "Subreddit rules, flair requirements, and restricted API registration make assisted handoff the honest default unless user provides an approved client.",
  },
] as const;

export function getPlatformById(id: PlatformId): PlatformCapability {
  const found = TARGET_PLATFORMS.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Unknown platform id: ${id}`);
  }
  return found;
}

export function getPlatformsByMode(mode: PublishingMode): readonly PlatformCapability[] {
  return TARGET_PLATFORMS.filter((p) => p.publishingMode === mode);
}
