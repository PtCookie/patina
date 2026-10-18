# Pagination

Page links for long lists: ghost 36px squares, the current page outlined on `background`.

**Consumer provides:** the current page, the total, and an href per page (real links, so pages are crawlable and shareable).

- Show first, last, current ± 1, and an ellipsis for the gaps; Previous/Next carry a caret and text, and disable (50%) at the ends.
- Numbers use tabular figures. The current page has `aria-current="page"`.
