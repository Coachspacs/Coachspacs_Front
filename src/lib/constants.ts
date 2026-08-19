import type { FooterLinkGroup, NavigationItem } from "@/types";

export const SITE_NAME_KEY = "site.name";
export const SITE_TAGLINE_KEY = "site.tagline";

export const HEADER_NAV_ITEMS: NavigationItem[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.courses", href: "#courses" },
  { key: "nav.categories", href: "#categories" },
  { key: "nav.becomeInstructor", href: "#become-instructor" },
];

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    key: "footer.company",
    links: [
      { key: "footer.aboutUs", href: "#about" },
      { key: "footer.careers", href: "#careers" },
      { key: "footer.blog", href: "#blog" },
    ],
  },
  {
    key: "footer.support",
    links: [
      { key: "footer.helpCenter", href: "#help" },
      { key: "footer.safetyCenter", href: "#safety" },
      { key: "footer.contact", href: "#contact" },
    ],
  },
];
