import type { Region, RegionPageContent, PostLocation, SeoTerm, PostTerm } from "./seo";
/**
 * DB 테이블 타입 정의 (수기). 마이그레이션과 1:1로 동기화 유지.
 * 향후 Supabase CLI `gen types`로 자동 생성 전환 가능.
 */

// ============================================================
// leak_requests
// ============================================================

export type RequestStatus = "pending" | "quote" | "active" | "done";

export const STATUS_ORDER: readonly RequestStatus[] = [
  "pending",
  "quote",
  "active",
  "done",
] as const;

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "작업접수",
  quote: "상담진행",
  active: "작업출동",
  done: "작업완료",
};

/** 전체 select 결과 (관리자용). */
export type LeakRequest = {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  masked_name: string;
  phone: string;
  region: string | null;
  apartment: string | null;
  symptom: string;
  utm_source: string | null;
  utm_campaign: string | null;
  city_code: string | null;
  status: RequestStatus;
  admin_memo: string | null;
  visible_on_board: boolean;
};

/** Insert 가능 필드. 폼은 user-facing 필드만 채우고, admin/seed는 status·visible 등도 덮어쓴다. */
export type LeakRequestInsert = {
  // user-facing (폼)
  customer_name: string;
  phone: string;
  symptom: string;
  region?: string | null;
  apartment?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  city_code?: string | null;
  // admin override
  status?: RequestStatus;
  admin_memo?: string | null;
  visible_on_board?: boolean;
};

/** 공개 보드 SELECT 시 필요한 컬럼만. RLS가 customer_name·phone 등 노출은 막지 못하므로
 * 클라이언트는 `select(...)`에 이 필드만 명시할 것. */
export type LeakRequestBoardItem = Pick<
  LeakRequest,
  "id" | "masked_name" | "region" | "status" | "created_at" | "updated_at"
>;

// ============================================================
// posts
// ============================================================

export type Post = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  region_tags: string[];
  category: string | null;
  view_count: number;
  published: boolean;
  published_at: string;
};

export type PostInsert = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  region_tags?: string[];
  category?: string | null;
  published?: boolean;
  published_at?: string;
};

// ============================================================
// post_images
// ============================================================

export type PostImage = {
  id: string;
  post_id: string;
  url: string;
  alt_text: string | null;
  caption: string | null;
  work_stage: string | null;
  image_variant: "original" | "annotated";
  original_image_id: string | null;
  overlay_text: string | null;
  sort_order: number;
  created_at: string;
};

export type PostImageInsert = {
  post_id: string;
  url: string;
  alt_text?: string | null;
  caption?: string | null;
  work_stage?: string | null;
  image_variant?: "original" | "annotated";
  original_image_id?: string | null;
  overlay_text?: string | null;
  sort_order?: number;
};

// ============================================================
// site_content
// ============================================================

export type SiteContent = {
  key: string;
  value: unknown;
  updated_at: string;
};

export type SiteContentInsert = {
  key: string;
  value: unknown;
};

// ============================================================
// 사이트 콘텐츠 JSON 타입
// ============================================================

export type HeroSlideData = {
  src: string;
  alt: string;
  tag: string;
  tagColor: string;
  line1: string;
  line2: string;
  line2Color: string;
  sub: string;
  hashtags: string[];
};

export type HeroBannerData = {
  highlight: string;
  text: string;
};

export type TestimonialData = {
  author: string;
  region: string;
  category: string;
  ko: string;
  body: string;
};

export type FaqItemData = {
  question: string;
  answer: string;
};

export type AboutCardData = {
  src: string;
  alt: string;
  icon: string;
  line1: string;
  line2: string;
};

export type MasterCardData = {
  key: string;
  icon: string;
  visualText?: string;
  body: string;
  highlight: string;
};

export type MasterSectionData = {
  title: string;
  subtitle: string;
  cta: string;
  cards: MasterCardData[];
};

export type TimeCardData = {
  icon: string;
  big: string;
  caption: string;
};

export type TimeSectionData = {
  preTitle: string;
  title: string;
  description: string;
  footer: string;
  cards: TimeCardData[];
};

export type ServiceData = {
  cat: string | null;
  ko: string;
  desc: string;
  icon: string;
  href?: string;
  image?: string;
};

export type EquipmentData = {
  name: string;
  caption: string;
};

export type DemoRequestData = {
  id: string;
  masked_name: string;
  region: string;
  metro: string;
  category: string;
  symptom: string;
};

// ============================================================
// Database 제네릭 — supabase-js / @supabase/ssr 클라이언트에 주입
// ============================================================

type SeoTable<T> = { Row: T; Insert: T; Update: Partial<T>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      regions: SeoTable<Region>;
      region_pages: SeoTable<RegionPageContent>;
      post_locations: SeoTable<PostLocation>;
      seo_terms: SeoTable<SeoTerm>;
      post_terms: SeoTable<PostTerm>;
      leak_requests: {
        Row: LeakRequest;
        Insert: LeakRequestInsert;
        Update: Partial<LeakRequestInsert> &
          Partial<Pick<LeakRequest, "status" | "admin_memo" | "visible_on_board">>;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: Partial<PostInsert>;
        Relationships: [];
      };
      post_images: {
        Row: PostImage;
        Insert: PostImageInsert;
        Update: Partial<PostImageInsert>;
        Relationships: [
          {
            foreignKeyName: "post_images_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      site_content: {
        Row: SiteContent;
        Insert: SiteContentInsert;
        Update: Partial<SiteContentInsert>;
        Relationships: [];
      };
    };
    Views: { leak_request_board: { Row: LeakRequestBoardItem; Relationships: [] } };
    Functions: {
      set_post_seo: {
        Args: { p_post_id: string; p_region_id: string | null; p_term_ids: string[] };
        Returns: undefined;
      };
      get_region_posts: { Args: { p_region_id: string }; Returns: Post[] };
    };
  };
};
