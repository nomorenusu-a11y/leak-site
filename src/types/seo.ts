export type Region = {
  id: string;
  parent_id: string | null;
  level: "city" | "district" | "dong";
  slug: string;
  name: string;
  active: boolean;
  source_url: string;
  source_checked_on: string;
};
export type RegionPageContent = {
  region_id: string;
  title: string;
  description: string;
  intro: string;
  faq: { question: string; answer: string }[];
  published: boolean;
  indexable: boolean;
  updated_at: string;
};
export type PostLocation = { post_id: string; region_id: string; verified_at: string };
export type TermAxis = "building_type" | "leak_type" | "symptom" | "detection_method" | "work_type";
export type SeoTerm = { id: string; axis: TermAxis; slug: string; label: string };
export type PostTerm = { post_id: string; term_id: string; axis: TermAxis };
