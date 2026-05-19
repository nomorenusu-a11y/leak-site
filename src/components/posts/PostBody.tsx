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
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
