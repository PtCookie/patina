import * as React from "react";

import { cn } from "@/lib/utils";

// Long-form reading text: Newsreader (with MaruBuri for Korean) at 17/28, headings in the `heading` family.
// It styles the plain elements inside it (h1, h2, p, blockquote, code), so write ordinary markup. The text column
// is 640px wide (the article is 688px with its 24px side padding); put an `ArticleEyebrow` above the title for the date or section.
function Article({ className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="article"
      className={cn(
        "max-w-172 px-6 py-8 font-serif text-foreground [&_blockquote]:mb-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-[17px]/7 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-[14px] [&_h1]:mt-2 [&_h1]:mb-4 [&_h1]:font-heading [&_h1]:text-[30px]/9 [&_h1]:font-semibold [&_h1]:tracking-[-0.02em] [&_h1]:text-balance [&_h1]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-heading [&_h2]:text-2xl/8 [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h2]:text-balance [&_h2]:text-foreground [&_p]:mb-4 [&_p]:text-[17px]/7",
        className,
      )}
      {...props}
    />
  );
}

function ArticleEyebrow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="article-eyebrow"
      className={cn("font-sans text-xs/4 font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Article, ArticleEyebrow };
