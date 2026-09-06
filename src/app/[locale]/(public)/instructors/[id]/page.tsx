import React from "react";
import { getPublicInstructorByIdOrSlug } from "@/lib/instructorProfile";
import { PublicInstructorProfileView } from "@/components/instructor/PublicInstructorProfileView";

interface InstructorPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function PublicInstructorProfilePage({ params }: InstructorPageProps) {
  const { id } = await params;

  const instructor = getPublicInstructorByIdOrSlug(id);

  return <PublicInstructorProfileView instructor={instructor} />;
}
