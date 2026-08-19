import React from "react";
import { CourseCatalogView } from "@/components/catalog/CourseCatalogView";

export const metadata = {
  title: "Course Catalog | Coach Space",
  description: "Browse certified courses and master new skills with world-class mentors on Coach Space.",
};

export default function CoursesPage() {
  return <CourseCatalogView />;
}
