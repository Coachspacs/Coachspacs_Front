import React from "react";
import { draftMode } from "next/headers";
import { CmsServerService } from "@/services/cms/cmsServerService";
import { HomePageClient } from "./HomePageClient";
import { TargetAudienceView } from "@/types/cms";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isPreviewParam = resolvedParams?.preview === "true";
  const { isEnabled: isDraftMode } = await draftMode();
  const isDraft = isDraftMode || isPreviewParam;

  const rawView = (resolvedParams?.view as string) || undefined;
  const previewView: TargetAudienceView | undefined =
    rawView === "instructor" || rawView === "student" || rawView === "guest"
      ? rawView
      : undefined;

  const cmsSections = await CmsServerService.getLandingSections(isDraft);

  return (
    <HomePageClient
      cmsSections={cmsSections}
      previewView={previewView}
      isPreview={isDraft}
    />
  );
}
