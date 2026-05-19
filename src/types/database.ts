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
  pending: "접수",
  quote: "견적발송중",
  active: "작업중",
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

/** 사용자 견적 폼이 직접 채우는 필드만. */
export type LeakRequestInsert = {
  customer_name: string;
  phone: string;
  symptom: string;
  region?: string | null;
  apartment?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  city_code?: string | null;
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
  sort_order: number;
  created_at: string;
};

export type PostImageInsert = {
  post_id: string;
  url: string;
  alt_text?: string | null;
  sort_order?: number;
};

// ============================================================
// Database 제네릭 — supabase-js / @supabase/ssr 클라이언트에 주입
// ============================================================

export type Database = {
  public: {
    Tables: {
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
