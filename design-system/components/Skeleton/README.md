# Skeleton

A `muted` placeholder shaped like the content that is loading; pulses at 2s, still under `prefers-reduced-motion`.

**Consumer provides:** the shape — width and height matching the real content (text lines 14px tall at `radius-md`, blocks at `radius`, avatars as circles).

- Mirror the final layout exactly (same rows, same columns) so nothing jumps when data arrives; for tables, skeleton the cells, not the whole table.
- Show it only after ~300ms of waiting; for under a second of load, show nothing.
- Never put text inside a skeleton; announce loading with `aria-busy` on the region.
