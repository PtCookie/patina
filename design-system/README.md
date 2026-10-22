A single emerald accent on a calm blue-gray neutral (Mist). The web starts from the shadcn/ui **Luma** style with a tighter radius scale and corrected contrast; desktop (Slint) uses the same tokens with a **compact density**; Android uses a Material 3 theme built from the same tokens. Headings are set in JetBrains Mono, body text in Inter, Korean in Pretendard, long-form body text in Newsreader and MaruBuri, and icons come from Phosphor.

## How to use this system

- Use colour **only by semantic token name** (`background`, `foreground`, `primary`, `muted-foreground` …). No hex or oklch literals, no Tailwind palette classes (`bg-emerald-600`, `text-zinc-500`), no arbitrary values (`bg-[#…]`).
- Web projects initialise from the Patina registry (`npx shadcn@latest init https://patina.ptcookie.net/r/base.json`), which writes this system's tokens into the project's CSS; do not copy values by hand. The tokens started from the shadcn preset `b3JSmtB71E` (Luma · Mist · Emerald · Base UI). Values that differ from the preset: `secondary` and `secondary-foreground`, light `muted-foreground`, `destructive`, `ring` and `sidebar-primary`, and the whole radius scale. Added tokens: `link`, and `success`, `warning` and `info` with their `-muted` / `-foreground` variants. In Tailwind, use the shadcn names as they are: `bg-primary`, `text-muted-foreground`.
- Slint apps reference only the global generated from `tokens.json` (`Theme.current.<token>`, mode via `Theme.current-mode`). Control heights and row heights use the `compact-*` tokens.
- Android (Compose) apps use the static Material 3 theme generated from `tokens.json`. Material You dynamic colour is not used. Colour roles, typography and shapes follow the Android section.
- Before building a new component, check the Patina registry (`/r/registry.json`) and the shadcn registry for an existing one.
- The component previews are demos built from the `pt-` classes in `components/bundle.css` and the behaviour in `components/bundle.js` (ARIA and data attributes). Real web projects use shadcn (Base UI) components and match the previews' values and states.

## Content fundamentals

- UI copy is in English, in **sentence case**, starting with a verb: "Commit", "Delete branch", "Fetch from origin". No Title Case and no all caps (panel headers in `compact-label` are sentence case too).
- Keep it short. Buttons take 1–3 words; tooltips give the control name plus its shortcut.
- Address the user as "you"; the app never appears as the subject: "Pushed 3 commits to main", "Couldn't reach origin".
- Identifiers (commit SHAs, branches and paths, SQL, cell values, timestamps) are always set in `mono` / `mono-sm`. Names (file names, displayed branch names) use the body face.
- No emoji. Show status with an icon plus a word.

## Visual foundations

### Color

- Most of the screen is neutral: `foreground` text on `background`, secondary text in `muted-foreground`, quiet fills in `muted`, lines in `border`.
- `primary` (emerald) is for **one primary action per screen** and for check marks and active states only. Never for decoration or large areas.
- Destructive actions use `destructive` text on a `destructive-muted` tint (10% light / 20% dark). There is no solid red button.
- The status colours `success` / `warning` / `info` appear as text or icons on a `-muted` tint; add `-foreground` only when a solid fill is needed. Success is distinguished from `primary`, and destructive from the others, by hue alone, so **always pair them with an icon and a word**.
- `primary-muted` is the tint of a selected or highlighted primary state (a selected toggle or row, the targeted line of a code listing); `link` text sits on it.
- Charts use `chart-1`…`chart-5`, a sequential teal ramp. Use it for ordered data; label categorical data directly. Light and dark have their own values so that every step is visible on the page and on a card.
- Emerald text (links, the link button) uses `link`, not `primary`. In dark mode `primary` is a fill only.
- All neutrals come from the single Mist family (hue 197–229): `secondary` sits on the same step as `muted` (Mist 100 / 800).

### Type

- Every family is a stack of a Latin face followed by a Korean face. Where the Latin face has no Hangul, only the Hangul glyphs fall back.

| Family | Stack | Use |
|---|---|---|
| `sans` | Inter → Pretendard | All body text and controls |
| `heading` | JetBrains Mono → Pretendard | Headings |
| `mono` | JetBrains Mono → D2Coding | SHAs, paths, code, mostly-English cells |
| `mono-ko` | D2Coding | Where Hangul is mixed in and columns must align (diffs, data grids, logs) |
| `serif` | Newsreader → MaruBuri | Body text and quotations in long-form writing only (blog, docs, release notes). Not for headings or UI |

- Body `body` 14/20; buttons, menus and labels `label` 14/20 medium; badges `caption` 12/16 medium.
- Headings: card and dialog titles `heading-md` 16/24 medium; empty states and alert dialogs `heading-lg` 18/28. Page titles `heading-2xl`, one per screen. Blog and docs use the same `heading` family. Apply `text-wrap: balance` to titles.
- Code and identifiers: `mono` 13/20, `mono-sm` 12/16. Two English characters in JetBrains Mono and one Hangul character in D2Coding differ in width, so lines mixing Hangul drift out of column alignment in `mono`. Use `mono-ko` when alignment matters. Use `font-variant-numeric: tabular-nums` for number columns.
- Desktop: `compact-body` 13/18, `compact-label` 12/16 medium.
- Long-form: article title `heading-2xl`, subheadings `heading-xl` (h2) and `heading-lg` (h3), body `serif-body` 17/28 (60–75 characters per line), quotations `serif-quote` in italic (MaruBuri has no italic, so Hangul stays upright). Headings are mono and body is serif; that split is the role division.
- The font files live in this system's `fonts/` (Inter, Pretendard, JetBrains Mono and Newsreader are variable; D2Coding is Regular/Bold TTF; MaruBuri is Regular/SemiBold/Bold OTF). On the web, Inter, JetBrains Mono and Newsreader come from Fontsource variable packages and Pretendard from the `pretendard` package, D2Coding and MaruBuri are the official files copied into the project, and Slint bundles the files with the app. Pretendard, D2Coding and MaruBuri are used as the official files; if you make your own subset, rename it (Reserved Font Name).

### Spacing & density

- 4px unit (`space-1` = 4px … `space-12` = 48px). Names are multiples (`space-1.5` = 6px).
- **comfortable (web, Luma original)**: control `control-md` 36px, padding `space-3`, card padding and gap `space-6`, table header `table-head` 48px.
- **compact (desktop, ADDED)**: control `compact-control` 28px, list, tree and grid rows `compact-row` 28px, panel header `compact-head` 32px, horizontal padding `compact-pad` 8px. Information-dense tools (Git clients, DB viewers) are always compact.
- Never mix the two densities on one screen.

### Radius

- A tight scale on an 8px base: `radius-sm` 4 · `radius-md` 6 · `radius` 8 · `radius-xl` 10 · `radius-2xl` 12 · `radius-3xl` 16 · `radius-full`.
- Buttons, inputs, selects, textareas and input groups use `radius` 8px. Menus, select lists, popovers and alerts use `radius-2xl` 12px. Cards and dialogs use `radius-3xl` 16px. Tooltips and compact controls use `radius-md`. Checkboxes, kbd and tree rows use `radius-sm`. Badges, switches and tabs (track and trigger) use `radius-full`.
- **Pill option**: buttons, inputs, selects and input groups can opt into `radius-full` with `shape="pill"` (web class `--pill`). It is not the default; when used, switch every control in the group and on the screen together.
- An inner element's radius is at most the outer radius minus the padding. When rows reach the edge, as in a menu, the outer container clips them.

### Elevation & borders

- Instead of borders, use a **1px foreground ring plus a shadow**: cards use `shadow-card`; floating elements (menus, selects, popovers, dialogs) use `shadow-menu`.
- Controls (inputs, selects) are set apart by a `control` fill and no border; checkbox and switch tracks use `control-strong`.
- `border` is for tables, dividers and outline buttons only. Use `border` to divide the inside of a card, too.
- The dialog overlay is `overlay` (black 30%) with an 8px blur.

### States

- Hover has dedicated tokens: primary button `primary-hover`, secondary `secondary-hover`, outline `outline-hover`, ghost `ghost-hover`, table rows, toggles and open navigation `muted-hover`, destructive tint `destructive-muted-hover`, interactive card `shadow-card-hover`. A menu item highlights its **whole row** with `accent` (edge to edge of the menu with no margin or radius; the first and last rows reach the menu's top and bottom edges). A selected row uses `muted` (web) or `sidebar-accent` / `accent` (desktop). A selected tab uses `tab-active`; the text of unselected tabs uses `tab-foreground`.
- Components never build state colours with `color-mix` or opacity maths. Every derived colour must exist in `tokens.json` so the Slint and Android values are generated identical to the web.
- Pressed: the button moves down 1px. Disabled: 50% opacity, no pointer events.
- Focus: a 2px solid `ring` outline with a 2px offset, on web and desktop alike. No translucent rings.
- Invalid: a 3px `invalid-ring` plus `invalid-border` (visible in dark only); the helper text uses `destructive`.

### Motion

- Colour transitions 150ms, switch thumb movement 150ms, ease-out. Dialog overlay 100ms. There is no decorative animation.

## Iconography

- **Phosphor Icons**, Regular weight by default, Fill only for selected and active states. The web uses `@phosphor-icons/react`; Slint uses the SVGs from `@phosphor-icons/core` through `@image-url`. No CDN and no icon fonts. This system's previews inline the official SVGs in the markup (`<svg class="ph">`) and size them with `font-size` (`svg.ph` is 1em).
- Sizes: `icon-md` 16px (buttons, menus, inputs, alerts), `icon-sm` 12px (badges, kbd, xs buttons), `icon-lg` 20px (desktop toolbars).
- Icons follow `currentColor`; secondary icons use `muted-foreground`. Icon-only buttons need an `aria-label`.
- There is no logo mark yet. The product name is set as text in the `heading` face.

## Accessibility

- Every text colour is at least 4.5:1 in both themes on the background named in its usage note: `muted-foreground` is 4.7:1 even on `muted`, `destructive` is 4.8:1 on its own tint over `background` (4.5:1 over `card`), and `link` is at least 4.8:1 in light and 5.9:1 in dark.
- `ring` is at least 3:1 on `background`, `card` and `muted`.
- Every `chart-*` step is at least 3:1 on `background` and `card` in both themes (graphics need 3:1, not 4.5:1). The steps sit close together in lightness, so label series directly rather than by hue alone.
- `border` is a decorative divider (1.25:1). Mark a control's boundary with the `input` fill; where a control must have a border, use `ring` or `muted-foreground`.
- Success, primary and destructive differ by hue alone, so status is always shown as an icon plus a word.

## Licenses

- All fonts are SIL OFL 1.1 and Phosphor is MIT. They may be included in commercial apps; selling the font files on their own is not allowed.
- When you ship an app that embeds fonts or icons, include the matching full licence text from `assets/Licenses/` (an About → Licenses screen, or a `LICENSES/` folder in the package).
- Pretendard, D2Coding and MaruBuri carry a Reserved Font Name: if you modify them (including subsetting or format conversion) you cannot distribute the result under the same name. Use the official distribution files as they are. The official MaruBuri OTF is about 1/8 the size of the TTF (Regular is 960KB), so web and apps both use the OTF. If you need a woff2 conversion or a subset, distribute it as a derived font under a new name.
- MaruBuri is covered by the same OFL 1.1 terms as NAVER's Nanum fonts. Only the English original has legal effect. If including the full licence text is impractical, use the credit line NAVER recommends: "이 페이지에는 네이버에서 제공한 마루 부리 글꼴이 적용되어 있습니다." (in English: "This page uses the MaruBuri font provided by NAVER.")
