export type Category = 
  | "Leadership"
  | "Management"
  | "Communication"
  | "Strategy"
  | "Marketing"
  | "Design"
  | "Development"
  | "Data Science";

export type Level = "All Levels" | "Beginner" | "Intermediate" | "Advanced";

export type PriceFilter = "All" | "Free" | "Paid" | "Under $50" | "$50 - $100" | "$100+";

export type CourseLanguage = "All" | "English" | "Arabic";

export type SortOption = "most_popular" | "highest_rated" | "newest" | "price_low_to_high" | "price_high_to_low";

export interface Course {
  id: string;
  title: string;
  titleAr: string;
  category: Category;
  categoryAr: string;
  badge?: "Bestseller" | "New" | "Popular" | "Featured";
  badgeAr?: string;
  coverImage: string;
  instructorName: string;
  instructorNameAr: string;
  rating: number;
  reviewsCount: number;
  reviewsCountFormatted: string;
  price: number;
  priceFormatted: string;
  durationHours: number;
  durationFormatted: string;
  level: Level;
  language: CourseLanguage;
  isSaved?: boolean;
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedLevel: Level;
  selectedPrice: PriceFilter;
  selectedLanguage: CourseLanguage;
  sortBy: SortOption;
}
