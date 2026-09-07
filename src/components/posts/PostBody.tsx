import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { SANITIZE_SCHEMA } from "@/lib/markdown";

/**
 * Markdown 본문 렌더. rehype-sanitize로 XSS 차단.
 * dangerouslySetInnerHTML은 절대 쓰지 않음.
 */
export function PostBody({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-brand-700 prose-strong:text-slate-900 prose-img:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, SANITIZE_SCHEMA]]}
        components={{
          // 페이지 헤더가 유일한 H1이다. 관리자가 Markdown 본문에 `#`을
          // 사용해도 문서 구조가 깨지지 않도록 본문에서는 H2로 렌더링한다.
          h1: ({ children }) => <h2>{children}</h2>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
