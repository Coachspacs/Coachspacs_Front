import type { FooterLinkGroup, NavigationItem } from "@/types";

export const SITE_NAME = "Coach Space";
export const SITE_TAGLINE = "Premium mentorship and education platform for the modern professional.";
export const SITE_TAGLINE_AR = "منصة التدريب والتطوير الأولى للمحترفين وقادة المستقبل.";

export const HEADER_NAV_ITEMS: NavigationItem[] = [
  { label: "Home", labelAr: "الرئيسية", href: "/" },
  { label: "Courses", labelAr: "الدورات والبرامج", href: "#courses" },
  { label: "Categories", labelAr: "التخصصات", href: "#categories" },
  { label: "Become Instructor", labelAr: "انضم كمدرب", href: "#become-instructor" },
];

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "COMPANY",
    titleAr: "الشركة",
    links: [
      { label: "About Us", labelAr: "من نحن", href: "#about" },
      { label: "Careers", labelAr: "الوظائف", href: "#careers" },
      { label: "Blog", labelAr: "المدونة", href: "#blog" },
    ],
  },
  {
    title: "SUPPORT",
    titleAr: "الدعم الفني",
    links: [
      { label: "Help Center", labelAr: "مركز المساعدة", href: "#help" },
      { label: "Safety Center", labelAr: "مركز الأمان", href: "#safety" },
      { label: "Contact", labelAr: "تواصل معنا", href: "#contact" },
    ],
  },
];
