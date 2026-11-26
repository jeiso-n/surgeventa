"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import type { PlatformCapability, PublishingMode } from "@/domain/platforms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface PlatformMatrixProps {
  platforms: readonly PlatformCapability[];
}

type FilterMode = "all" | PublishingMode;

export function PlatformMatrix({ platforms }: PlatformMatrixProps) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const directCount = platforms.filter((p) => p.publishingMode === "direct_api").length;
  const assistedCount = platforms.filter((p) => p.publishingMode === "assisted_manual").length;

  const visible =
    filter === "all"
      ? platforms
      : platforms.filter((platform) => platform.publishingMode === filter);

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Target Platform Capability Matrix</CardTitle>
          <CardDescription>
            Verified official API access, account eligibility, and zero-spending compliance across
            all {platforms.length} target destinations. Integrations are scaffolded as contracts and
            not connected yet.
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label="Filter platforms">
          <Button
            size="sm"
            variant={filter === "all" ? "primary" : "outline"}
            onClick={() => setFilter("all")}
          >
            All ({platforms.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "direct_api" ? "primary" : "outline"}
            onClick={() => setFilter("direct_api")}
          >
            Direct API ({directCount})
          </Button>
          <Button
            size="sm"
            variant={filter === "assisted_manual" ? "primary" : "outline"}
            onClick={() => setFilter("assisted_manual")}
          >
            Assisted ({assistedCount})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {visible.map((platform) => {
            const isDirect = platform.publishingMode === "direct_api";
            return (
              <div
                key={platform.id}
                className="px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start hover:bg-surface-subtle/40 transition-colors"
              >
                <div className="md:col-span-3 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{platform.name}</span>
                    <Badge variant={isDirect ? "brand" : "warning"}>
                      {isDirect ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          Direct API
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                          Assisted Handoff
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted">{platform.apiName}</p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {platform.supportedMedia.map((media) => (
                      <span
                        key={media}
                        className="rounded bg-surface-subtle px-1.5 py-0.5 text-[11px] text-muted border border-border"
                      >
                        {media}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-5 space-y-1.5 text-xs">
                  <div className="flex items-start gap-1.5 text-foreground">
                    <Info className="h-3.5 w-3.5 text-muted shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{platform.accountEligibility}</span>
                  </div>
                  <p className="text-muted leading-relaxed pl-5">
                    {platform.approvalRequirement}
                  </p>
                </div>

                <div className="md:col-span-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted">Caption limit</span>
                    <span className="font-mono text-foreground">
                      {platform.maxCaptionLength.toLocaleString("en-US")} chars
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted">Personal accounts</span>
                    <span className="font-medium text-foreground">
                      {platform.personalAccountSupported ? "Supported" : "Business / Page only"}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 pt-1 text-muted">
                    <ShieldAlert
                      className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed">{platform.limitationsSummary}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
