export type QualityPost = {
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  region_tags: string[];
};

export type PostQualityAudit = {
  score: number;
  passed: number;
  total: number;
  issues: string[];
};

/** 공개 전과 관리자 성과판에서 동일하게 사용하는 콘텐츠 품질 기준. */
export function auditPostQuality(post: QualityPost): PostQualityAudit {
  const checks = [
    [post.title.length >= 18 && post.title.length <= 75, "제목 길이 18~75자"],
    [
      Boolean(post.excerpt && post.excerpt.length >= 40 && post.excerpt.length <= 165),
      "설명문 40~165자",
    ],
    [post.content.length >= 1800, "본문 1,800자 이상"],
    [(post.content.match(/^#{2,3}\s/gm) ?? []).length >= 5, "소제목 5개 이상"],
    [(post.content.match(/\]\(\/(?!\/)/g) ?? []).length >= 2, "내부 링크 2개 이상"],
    [post.content.includes("tel:+821057004026"), "전화 상담 연결"],
    [Boolean(post.cover_image_url), "대표 사진"],
    [post.region_tags.length > 0, "지역 태그"],
    [/<!-- content-type:[a-z_]+ -->/.test(post.content), "문서 유형 표시"],
  ] as const;
  const issues = checks.filter(([ok]) => !ok).map(([, label]) => label);
  const passed = checks.length - issues.length;
  return {
    score: Math.round((passed / checks.length) * 100),
    passed,
    total: checks.length,
    issues,
  };
}
