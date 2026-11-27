import type { PlatformCapability, PlatformId } from "@/domain/platforms";

export interface ValidationIssue {
  field: "caption" | "media" | "account" | "options";
  code: string;
  message: string;
  blocking: boolean;
}

export interface PublishDraftInput {
  postId: string;
  targetId: string;
  idempotencyKey: string;
  caption: string;
  mediaUrls: string[];
  platformOptions?: Record<string, unknown>;
}

export interface DirectPublishResult {
  kind: "direct_published";
  externalPostId: string;
  externalPostUrl?: string;
  publishedAt: Date;
}

export interface AssistedHandoffResult {
  kind: "assisted_ready";
  handoffUrl: string;
  preparedCaption: string;
  instructions: string[];
}

export type PublishExecutionResult = DirectPublishResult | AssistedHandoffResult;

/**
 * Contract implemented by every social platform integration in Surgeventa.
 * Guarantees uniform validation, capability introspection, and honest
 * differentiation between direct official API publishing and assisted handoffs.
 */
export interface PlatformAdapter {
  readonly id: PlatformId;
  readonly capability: PlatformCapability;

  validateDraft(input: PublishDraftInput): ValidationIssue[];

  /**
   * Publishes via the platform's official API or prepares an assisted handoff
   * payload when the platform has no free automated publishing tier.
   */
  publish(input: PublishDraftInput, decryptedAccessToken?: string): Promise<PublishExecutionResult>;
}
