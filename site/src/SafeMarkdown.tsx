import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Renders markdown (untrusted repo content — a plugin's README/SKILL.md/
 * agent prompt) as sanitized HTML. Never render marked's raw output
 * directly — always pass it through DOMPurify first.
 */
export function SafeMarkdown({ markdown }: { markdown: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await marked.parse(markdown || '');
      const clean = DOMPurify.sanitize(raw);
      if (!cancelled) setHtml(clean);
    })();
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
