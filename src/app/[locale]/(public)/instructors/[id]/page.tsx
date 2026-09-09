import React from "react";
import { getPublicInstructorByIdOrSlug } from "@/lib/instructorProfile";
import { instructorService } from "@/services/instructorService";
import { PublicInstructorProfileView } from "@/components/instructor/PublicInstructorProfileView";

interface InstructorPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function PublicInstructorProfilePage({ params }: InstructorPageProps) {
  const { id, locale } = await params;

  let instructor: any = null;

  try {
    const list = await instructorService.getInstructors(locale);
    if (Array.isArray(list) && list.length > 0) {
      const match = list.find(
        (inst: any) =>
          String(inst.id) === String(id) ||
          (inst.username && String(inst.username).toLowerCase() === id.toLowerCase()) ||
          (inst.slug && String(inst.slug).toLowerCase() === id.toLowerCase()) ||
          (inst.name && inst.name.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase()) ||
          (inst.full_name && inst.full_name.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase())
      );
      if (match) {
        instructor = {
          ...match,
          fullName: match.full_name || match.name,
          coursesCount: match.courses_count || match.total_courses || 0,
          studentsCount: match.students_count || 0,
        };
      }
    }
  } catch (err) {
    // Silent fallback to local registry
  }

  if (!instructor) {
    instructor = getPublicInstructorByIdOrSlug(id);
  }

  return <PublicInstructorProfileView instructor={instructor} />;
}
