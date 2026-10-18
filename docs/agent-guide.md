# Using Patina (guide for AI agents)

Patina is a design system with one set of tokens for three platforms: web (a shadcn registry on Base UI, Tailwind 4), Slint desktop apps and Android (Compose, Material 3). This guide is for an agent that builds a UI **in a project that uses Patina**. It tells you what to install, which names to use and which mistakes to avoid. It does not cover working on Patina itself.

Everything is served as static files from `https://patina.ptcookie.net`. Fetch `/llms.txt` for the index, or `/llms-full.txt` for this guide together with the design guide, the Android mapping and every component's notes in one file.

## Rules that always apply

1. **Colour only by semantic token name.** Use `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border` and the other names listed under "Colour tokens". Never write a hex, `oklch()` or `rgb()` literal, a Tailwind palette class (`bg-emerald-600`, `text-zinc-500`), an arbitrary colour (`bg-[#…]`), a `dark:` colour override or an opacity modifier on a colour (`bg-primary/80`). Dark mode is handled by the tokens; a component never branches on the theme.
2. **Never compute a state colour.** No `color-mix()` and no ad-hoc opacity. Hover, selected, tint and ring colours are tokens (`primary-hover`, `muted-hover`, `destructive-muted`, `invalid-ring`, …). If a state has no token, say so instead of inventing one.
3. **Use the Patina component before writing your own.** The components below replace the shadcn components of the same name. Install them with `shadcn add @patina/<name>`; do not copy markup from the stock shadcn registry.
4. **One primary action per view.** `primary` (emerald) marks that action, check marks and active states. It is never decoration and never a large area. Destructive actions are a tint (`destructive` text on `destructive-muted`), never a solid red button.
5. **Emerald text is `link`, not `primary`.** In dark mode `primary` is a dim fill; text that must read as emerald uses `text-link`.
6. **Status needs an icon and a word.** `success`, `warning`, `info` and `destructive` differ by hue only, so a status is never colour alone.
7. **Icons are Phosphor**, regular weight; fill only for selected or active. On the web import from `@phosphor-icons/react`. Do not mix in another icon set. An icon-only button needs an `aria-label`.
8. **UI copy is sentence case, starts with a verb, and is short.** "Commit", "Delete branch", "Fetch from origin". No Title Case, no all caps, no emoji. Buttons take one to three words. Identifiers (SHAs, branches, paths, SQL, timestamps) are set in the mono family.
9. **Two densities, never mixed on one screen.** Comfortable for the web (controls 36px), compact for dense desktop tools (controls 28px, the `compact-*` tokens).
10. **Radius comes from the scale.** Buttons, inputs and selects are `rounded-lg` (8px); menus and popovers `rounded-2xl`; cards `rounded-3xl`. `shape="pill"` (fully round) is an opt-in that you apply to a whole group or screen at once, never to a single control among square ones.

## Web (shadcn, Base UI, Tailwind 4)

Prerequisites: a React setup (for example Astro with React), Tailwind 4 and an `@/*` path alias.

**1. Initialise** once. This writes the tokens into the project's CSS (`:root`, `.dark`, `@theme inline`), installs the font packages and sets the icon library to Phosphor:

```bash
npx shadcn@latest init https://patina.ptcookie.net/r/base.json
```

**2. Register the namespace** in `components.json`:

```json
{ "registries": { "@patina": "https://patina.ptcookie.net/r/{name}.json" } }
```

**3. Add components** by name. Each Patina item has the name of the shadcn component it replaces and writes the same file:

```bash
npx shadcn@latest add @patina/button @patina/input @patina/card
```

**Order matters.** Install Patina components before stock ones. A stock component that depends on one that Patina replaces (`alert-dialog` needs `button`) will ask "The file button.tsx already exists. Would you like to overwrite?" — answer **no**, and never pass `--overwrite`. Components that Patina does not provide resolve from the stock registry and are rewritten for Phosphor and Base UI.

**Dark mode** is the project's own switch: the tokens define `:root` (light) and `.dark`, and the variant is `@custom-variant dark (&:is(.dark *))`. Toggle the `dark` class on `<html>`.

**Fonts.** Inter, JetBrains Mono and Newsreader come from Fontsource variable packages that the base item installs. Pretendard comes from the `pretendard` npm package. D2Coding and MaruBuri are official files you copy from `https://patina.ptcookie.net/fonts/` into `public/fonts` together with their `*-OFL.txt` licence texts, then load `/fonts/patina-fonts.css`. Pretendard, D2Coding and MaruBuri must stay the unmodified official files: do not subset, convert or re-encode them.

**Tailwind names.** Use the shadcn names as they are (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `shadow-(--shadow-card)`). Control heights are `h-(--control-md)`; spacing is the default Tailwind scale (4px steps).

**Font families.** `font-sans` (Inter then Pretendard) for text and controls, `font-heading` (JetBrains Mono then Pretendard) for headings, `font-mono` for identifiers and code, `font-serif` (Newsreader then MaruBuri) for long-form reading only. Titles and UI never use the serif.

**When a component needs something the system does not have** (a new variant, a state without a token), keep the change inside the component file, use only existing tokens, and report the gap to the maintainer rather than adding a literal.

## Slint (desktop)

The Slint library is a folder: the generated tokens plus compact desktop components (28px controls, `radius-md`, `compact-label` type). Download it once and commit it to the project; do not fetch it at build time:

```bash
mkdir -p ui && curl -L https://patina.ptcookie.net/slint/patina-slint.tar.gz | tar xz -C ui   # creates ui/patina/
```

Register `patina.slint` as a library, then import from `@patina`. In Rust (`build.rs`):

```rust
let config = slint_build::CompilerConfiguration::new().with_library_paths(std::collections::HashMap::from([
    ("patina".to_string(), std::path::PathBuf::from("ui/patina/patina.slint")),
]));
slint_build::compile_with_config("ui/app-window.slint", config).unwrap();
```

```slint
import { Theme, Button, ButtonVariant, Input, Badge, BadgeVariant } from "@patina";

export component AppWindow inherits Window {
    background: Theme.current.background;
    HorizontalLayout {
        padding: Theme.space-2;
        spacing: Theme.space-1;
        Input { placeholder-text: "Filter"; }
        Button { text: "Commit"; icon: @image-url("icons/git-commit.svg"); }
    }
}
```

Set `Theme.current-mode` (`ThemeMode.light` or `.dark`) to switch the theme. Read every colour, size, radius and spacing from `Theme` and every text style from `Typography`; never write a colour literal or a pixel value that a token provides.

Components exported by `@patina`:

- `Button` (`ButtonVariant`: `primary` for the one main action, `outline`, `secondary`, `ghost`, `destructive`, `link`): `text`, `icon`, `pill`, `enabled`, `tooltip`, `tooltip-shortcut`, `clicked()`. With an icon and no text it is a 28px square; give it a `tooltip`, which also names it for screen readers.
- `Input`: `text`, `placeholder-text`, `invalid`, `pill`, `enabled`, `read-only`, `edited(string)`, `accepted(string)`.
- `Badge` (`BadgeVariant`: `primary`, `secondary`, `outline`, `destructive`, `success`, `warning`, `info`): `text`, `icon`. A status badge always carries an icon.
- `Kbd`: `text`, `inverted`. `Tooltip`: the bubble itself (`text`, `shortcut`); use it through a component's `tooltip` property.
- `Separator`: `orientation`. `PaneHeader`: `text`, trailing children.
- `TreeRow` (sidebar rows: `text`, `icon`, `count`, `selected`, `clicked()`) and `ListRow` (list pane rows: `text`, `detail`, `selected`, `clicked()`).
- `Checkbox`: `text`, `checked`, `invalid`, `enabled`, `toggled(bool)`. `Switch` (28x16, the `sm` size): `text`, `checked`, `enabled`, `toggled(bool)`; a switch applies its state immediately, so use a `Checkbox` for options that wait for a Save.
- `Tabs`: `model` (two to five short labels), `current-index`, `selected(int)`. The panels are yours: show the one that `current-index` names.
- `Select`: `model`, `current-index` (-1 for none), `placeholder-text`, `invalid`, `pill`, `enabled`, `selected(int)`. Use it for four to fifteen options.
- `Menu` with `MenuItem` (`text`, `icon`, `shortcut`, `destructive`, `checked`, `enabled`, `clicked()`), `MenuLabel` and `MenuSeparator`: the surface and rows of a dropdown. Show it in a `PopupWindow` whose `y` is the trigger's height plus `Theme.space-1`, and call `popup.close()` in `clicked`. At most one destructive item, last.
- `Table` with `TableColumn` (`title`, `width`, `numeric`, `mono`): `columns`, `rows` (a list of string lists), `selected-row`, `row-clicked(int)`. A column with zero width shares the free space; give the table a height and the rows scroll under the header.

Layout: each control is a transparent slot at least 28px tall with the visible control centred in it, so in a `HorizontalLayout` toolbar the controls sit in the middle of the row without extra code. Inset sidebar rows 6px from the pane edge. Shadows are not part of the Slint library.

Fonts: Slint has no font fallback list, so bundle the official Inter, JetBrains Mono and Pretendard files with the app (D2Coding for `mono-ko`); the tokens name the first family of each stack.

## Android (Compose, Material 3)

The Android library is a folder of Kotlin files: the generated theme (`Color.kt`, `Type.kt`, `Shape.kt`, `Size.kt`, `Icons.kt`), `PatinaTheme.kt` and thin wrappers around Material 3 components. Download it once and commit it to the project; do not fetch it at build time:

```bash
mkdir -p app/src/main/kotlin && curl -L https://patina.ptcookie.net/android/patina-android.tar.gz | tar xz -C app/src/main/kotlin   # creates app/src/main/kotlin/patina/
```

The files declare the packages `patina.theme` (theme, tokens, icons) and `patina.ui` (components). Dependencies are Compose Material 3 and `androidx.compose.ui` only. The theme is a **static** Material 3 scheme: never use `dynamicLightColorScheme` or `dynamicDarkColorScheme`, and wrap the app once:

```kotlin
PatinaTheme(darkTheme = resolvedDark, uiFont = pretendard, monoFont = jetBrainsMono) {
    PatinaCard {
        Text("Notification access", style = MaterialTheme.typography.titleMedium)
        PatinaButton(onClick = onOpen) { Text("Open settings") }
    }
}
```

Read colours from `MaterialTheme.colorScheme` (the Material roles are mapped from the tokens, see `/android.md`), and from `PatinaTheme.colors` for what Material has no role for: `success`, `warning` (and their `Container` tints), `card`, `popover`, `control`, `controlStrong`. Spacing and sizes are `PatinaSpace.space3` and `PatinaSize.controlMd`; never write a colour literal, `Color(0x…)`, a `.copy(alpha = …)` on a colour or a raw dp value for spacing.

Components in `patina.ui` (use these instead of the Material ones; they set the shape, colours and sizes):

- `PatinaButton` (`PatinaButtonVariant`: `Primary` for the one main action, `Secondary`, `Outline`, `Ghost`, `Destructive` (a tint), `Link`): 36dp tall with a 48dp touch target, `radius` 8dp, `pill` for the fully rounded shape, `icon`, disabled at 50% opacity. Use `Link` for inline text actions where you would use a `TextButton`.
- `PatinaCard` (`PatinaCardSize.Default` or `Small`, optional `onClick`): the `card` surface with `radius-3xl`, a hairline border and padding and gap of `space-6` (`space-4` for `Small`). Do not nest cards.
- `PatinaTextField`: label above the field, `control` fill, 40dp, a 2dp `ring` outline on focus, `isError`, `supportingText`, `trailing`.
- `PatinaSwitch`, `PatinaRadioButton`, `PatinaFilterChip`: Material controls with the Patina colours.
- `PatinaAlertDialog`: the `popover` surface, `radius-3xl`, a `heading-md` title; use a `Destructive` or `Primary` `PatinaButton` as the confirm button and a `Ghost` one for cancel.
- `PatinaTopAppBar`: title on the `background` with an optional back button.
- `PatinaListItem`: headline, supporting line, leading and trailing slots.
- `PatinaBadge` (`PatinaBadgeVariant`): a status tint with an icon; always pair status with an icon and a word.
- `PatinaCheckbox`: `checked`, `onCheckedChange`, `label`, `isError`; the whole row is a 48dp target. Use `PatinaSwitch` for a setting that applies immediately.
- `PatinaTabs`: `labels`, `selectedIndex`, `onSelectedChange` (two to five short labels); the panels are yours.
- `PatinaSelect`: `options`, `selectedIndex` (null for none), `onSelectedChange`, `label`, `placeholder`, `isError`; use it for four to fifteen options.
- `PatinaDropdownMenu` with `PatinaDropdownMenuItem` (`text`, `icon`, `destructive`), `PatinaDropdownMenuLabel` and `PatinaDropdownMenuDivider`: a solid menu, at most one destructive item, last.
- `PatinaAlert` (`PatinaAlertVariant`: `Default`, `Destructive`, `Success`, `Warning`, `Info`): an inline message with an icon, a title, an optional description and an optional action.
- `PatinaBottomSheet`: a panel from the bottom edge on the `popover` surface. `PatinaTooltip`: the inverted label, opened by long press. `PatinaDivider`: a hairline. `PatinaSkeleton`: a pulsing `muted` placeholder sized like the content.

Icons are Phosphor, built into `PatinaIcons` (`ArrowLeft`, `CaretDown`, `Check`, `CheckCircle`, `Info`, `Warning`, `X`, `XCircle`); draw them with `Icon(PatinaIcons.Check, contentDescription = …)` and size them with `Modifier.size(PatinaSize.iconMd)`. For other icons import the official Phosphor SVGs as vector drawables; do not mix in Material Icons.

System bars: with `enableEdgeToEdge()` pass a `SystemBarStyle` built from the same resolved dark flag as `PatinaTheme`, or the status bar icons stay dark on a dark screen.

Fonts: Compose cannot chain fonts, so bundle the official Pretendard OTFs (Regular, Medium, SemiBold, Bold) in `res/font` for `uiFont` and JetBrains Mono for `monoFont`; do not subset or convert them.

## Before you finish a screen

- Every colour is a token name; there is no literal, palette class, opacity modifier or `dark:` colour.
- Exactly one primary action; destructive actions are tinted.
- Status shown with an icon and a word.
- Copy is sentence case and verb-first.
- Icon-only buttons have an `aria-label`; focus is the 2px `ring` outline that the components already draw.
- Controls on one screen share one shape (all default or all pill) and one density.

## Licence

Patina's code and documentation are MIT-licensed (`https://patina.ptcookie.net/LICENSE`). The fonts are not: they keep their SIL OFL 1.1 licences. When you copy Patina's files into a project, keep the notices in the files (the Phosphor notice in `Icons.kt`) and ship `https://patina.ptcookie.net/THIRD_PARTY_NOTICES.md` and the licence text of every font you bundle.
