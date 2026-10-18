# DesktopShell

A showcase of the ADDED compact density for Slint desktop tools (PathPoint, GroupGrid): toolbar, sidebar tree, list pane and detail pane in one window.

**Consumer provides:** the panes' content; the shell only fixes density and surfaces.

- Window: `background`, `radius-2xl`; toolbar 40px on `sidebar` with a `border` bottom. Sidebar pane on `sidebar`, list and detail on `background`, panes divided by `border`.
- Toolbar buttons (`compact-control` 28px, padding `compact-pad`, `radius-md`, `compact-label`) are ghost by default; one `primary` action at the right end.
- Pane headers: `compact-head` 32px, `compact-label` in `muted-foreground`. Tree rows: `compact-row` 28px, `radius-sm`, selected on `sidebar-accent`.
- File and ref names in `compact-body`; paths and SHAs under them in `mono-sm`.
- Diffs: `mono` 12/18 on `card`, `radius-xl`, `shadow-card`; added lines on `success-muted`, removed on `destructive` at 10%, hunk headers on `muted`.
- Focus is the same 2px `ring` outline as the web.
