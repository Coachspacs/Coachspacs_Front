"use client";

import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { TopCategoriesSection } from "@/components/home/TopCategoriesSection";
import { MasterYourCraftSection } from "@/components/home/MasterYourCraftSection";
import { WhyCoachSpaceStandsOutSection } from "@/components/home/WhyCoachSpaceStandsOutSection";
import { RealStoriesSection } from "@/components/home/RealStoriesSection";
import { FaqSection } from "@/components/home/FaqSection";
import { JoinFutureSection } from "@/components/home/JoinFutureSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      <HeroSection />
      <TopCategoriesSection />
      <MasterYourCraftSection />
      <WhyCoachSpaceStandsOutSection />
      <RealStoriesSection />
      <NewsletterSection />
      <FaqSection />
      <JoinFutureSection />
    </div>
  );
}
