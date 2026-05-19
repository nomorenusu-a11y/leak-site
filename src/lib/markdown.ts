import { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";

/**
 * react-markdown + rehype-sanitize용 화이트리스트 스키마.
 * defaultSchema가 이미 `img/a/code`의 안전한 속성(src, alt, href, className 등)을
 * 허용하므로 별도 확장 없이 그대로 사용. 시드 컨텐츠가 더 풍부해지면 여기서 확장.
 */
export const SANITIZE_SCHEMA: Schema = defaultSchema;

/**
 * Markdown → plain text. 메타 description·OG description용.
 * 정밀한 AST 파싱 대신 정규식 기반 best-effort.
 */
export function markdownToPlainText(md: string, limit = 160): string {
  let text = md;
  text = text.replace(/```[\s\S]*?```/g, " "); // fenced code block 제거
  text = text.replace(/`([^`]+)`/g, "$1"); // inline code
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " "); // 이미지
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"); // 링크 → 텍스트
  text = text.replace(/^>\s?/gm, ""); // blockquote
  text = text.replace(/^#{1,6}\s+/gm, ""); // heading
  text = text.replace(/^[-*+]\s+/gm, ""); // list marker
  text = text.replace(/^\d+\.\s+/gm, ""); // ordered list
  text = text.replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1"); // bold/italic
  text = text.replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return text.slice(0, limit).trimEnd() + "…";
}
