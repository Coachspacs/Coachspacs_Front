import React from "react";
import { draftMode } from "next/headers";
import { CmsServerService } from "@/services/cms/cmsServerService";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
  const { isEnabled: isDraftMode } = await draftMode();
  const cmsSections = await CmsServerService.getLandingSections(isDraftMode);

  return <HomePageClient cmsSections={cmsSections} />;
}
