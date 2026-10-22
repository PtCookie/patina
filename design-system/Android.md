# Android (Jetpack Compose)

Android apps use this system through a **static Material 3 theme generated from `tokens.json`** — not Material You dynamic color. Every value below comes from a token or a fixed formula over tokens, so the generator can reproduce it; never hand-edit the hex.

## Color scheme

Material 3 asks for more roles than the web palette has. The mapping keeps every M3 text-on-fill pair at 4.5:1 or more in both themes (`outline` 3:1).

- **`primary` is `link`, not the web `primary` fill.** M3 paints `primary` as text (TextButton, links, selected labels), and the web dark `primary` fill only reads 2.6:1 as text. On Android, dark filled buttons are therefore the brighter emerald with dark `onPrimary`; the web's dark fill becomes `primaryContainer`.
- `secondary*` stays Mist neutral; `tertiary*` is `info`; `error*` is `destructive`. `success` and `warning` have no M3 role — read them from an extension object (`PatinaColors.success` …) with the token values.
- `surfaceTint` equals `surface`, which switches off M3's tonal elevation tint; elevation is shadow only, as on the web.
- Container colors are solid mixes (`X% of a token over background`), because M3 surfaces must be opaque.
- The web's alpha state tokens (`*-hover`, `ghost-hover`, `tab-active`, `invalid-*`, `destructive-muted`, `control` …) are not mapped: Material's ripple and state layers replace hover, and containers above are solid by design.

| M3 role | Source | Light | Dark |
|---|---|---|---|
| `primary` | `link` | `#007A55` | `#00BC7D` |
| `onPrimary` | light `primary-foreground` · dark `sidebar-primary-foreground` | `#ECFDF5` | `#002C22` |
| `primaryContainer` | light `primary` 12% over `background` · dark `primary` | `#E0EFEB` | `#006045` |
| `onPrimaryContainer` | light dark-theme `primary` · dark `primary-foreground` | `#006045` | `#ECFDF5` |
| `inversePrimary` | the other theme's `primary` role | `#00BC7D` | `#007A55` |
| `secondary` | `muted-foreground` | `#5E6F73` | `#9CA8AB` |
| `onSecondary` | `background` | `#FFFFFF` | `#090B0C` |
| `secondaryContainer` | `secondary` | `#F1F3F3` | `#22292B` |
| `onSecondaryContainer` | `secondary-foreground` | `#161B1D` | `#F9FBFB` |
| `tertiary` | `info` | `#0069A8` | `#00BCFF` |
| `onTertiary` | `info-foreground` | `#F0F9FF` | `#052F4A` |
| `tertiaryContainer` | `info` 12% (dark 24%) over `background` | `#E0EDF5` | `#073546` |
| `onTertiaryContainer` | `info` | `#0069A8` | `#00BCFF` |
| `error` | `destructive` | `#CD000E` | `#FF6467` |
| `onError` | light near-white · dark `background` | `#FAFAFA` | `#090B0C` |
| `errorContainer` | `destructive` 12% (dark 24%) over `background` | `#F9E0E2` | `#442022` |
| `onErrorContainer` | `destructive` | `#CD000E` | `#FF6467` |
| `background` | `background` | `#FFFFFF` | `#090B0C` |
| `onBackground` | `foreground` | `#090B0C` | `#F9FBFB` |
| `surface` | `background` | `#FFFFFF` | `#090B0C` |
| `onSurface` | `foreground` | `#090B0C` | `#F9FBFB` |
| `surfaceVariant` | `muted` | `#F1F3F3` | `#22292B` |
| `onSurfaceVariant` | `muted-foreground` | `#5E6F73` | `#9CA8AB` |
| `surfaceTint` | `background` (no tonal tint) | `#FFFFFF` | `#090B0C` |
| `inverseSurface` | `foreground` | `#090B0C` | `#F9FBFB` |
| `inverseOnSurface` | `background` | `#FFFFFF` | `#090B0C` |
| `outline` | `ring` | `#738488` | `#67787C` |
| `outlineVariant` | `border` (dark: flattened over `background`) | `#E3E7E8` | `#222324` |
| `scrim` | black | `#000000` | `#000000` |
| `surfaceContainerLowest` | `background` | `#FFFFFF` | `#090B0C` |
| `surfaceContainerLow` | light `sidebar` · dark derived step | `#F9FBFB` | `#101314` |
| `surfaceContainer` | light `muted` · dark `card` | `#F1F3F3` | `#161B1D` |
| `surfaceContainerHigh` | derived step | `#EEF1F1` | `#1C2223` |
| `surfaceContainerHighest` | light derived step (keeps `muted-foreground` ≥4.5:1) · dark `muted` | `#EBEEEF` | `#22292B` |
| `surfaceDim` | light `border` · dark `background` | `#E3E7E8` | `#090B0C` |
| `surfaceBright` | light `background` · dark `muted` | `#FFFFFF` | `#22292B` |

```kotlin
// patina/theme/Color.kt — generated from tokens.json; do not edit by hand
val PatinaLight = lightColorScheme(
    primary = Color(0xFF007A55),
    onPrimary = Color(0xFFECFDF5),
    primaryContainer = Color(0xFFE0EFEB),
    onPrimaryContainer = Color(0xFF006045),
    inversePrimary = Color(0xFF00BC7D),
    secondary = Color(0xFF5E6F73),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFF1F3F3),
    onSecondaryContainer = Color(0xFF161B1D),
    tertiary = Color(0xFF0069A8),
    onTertiary = Color(0xFFF0F9FF),
    tertiaryContainer = Color(0xFFE0EDF5),
    onTertiaryContainer = Color(0xFF0069A8),
    error = Color(0xFFCD000E),
    onError = Color(0xFFFAFAFA),
    errorContainer = Color(0xFFF9E0E2),
    onErrorContainer = Color(0xFFCD000E),
    background = Color(0xFFFFFFFF),
    onBackground = Color(0xFF090B0C),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF090B0C),
    surfaceVariant = Color(0xFFF1F3F3),
    onSurfaceVariant = Color(0xFF5E6F73),
    surfaceTint = Color(0xFFFFFFFF),
    inverseSurface = Color(0xFF090B0C),
    inverseOnSurface = Color(0xFFFFFFFF),
    outline = Color(0xFF738488),
    outlineVariant = Color(0xFFE3E7E8),
    scrim = Color(0xFF000000),
    surfaceContainerLowest = Color(0xFFFFFFFF),
    surfaceContainerLow = Color(0xFFF9FBFB),
    surfaceContainer = Color(0xFFF1F3F3),
    surfaceContainerHigh = Color(0xFFEEF1F1),
    surfaceContainerHighest = Color(0xFFEBEEEF),
    surfaceDim = Color(0xFFE3E7E8),
    surfaceBright = Color(0xFFFFFFFF),
)
val PatinaDark = darkColorScheme(
    primary = Color(0xFF00BC7D),
    onPrimary = Color(0xFF002C22),
    primaryContainer = Color(0xFF006045),
    onPrimaryContainer = Color(0xFFECFDF5),
    inversePrimary = Color(0xFF007A55),
    secondary = Color(0xFF9CA8AB),
    onSecondary = Color(0xFF090B0C),
    secondaryContainer = Color(0xFF22292B),
    onSecondaryContainer = Color(0xFFF9FBFB),
    tertiary = Color(0xFF00BCFF),
    onTertiary = Color(0xFF052F4A),
    tertiaryContainer = Color(0xFF073546),
    onTertiaryContainer = Color(0xFF00BCFF),
    error = Color(0xFFFF6467),
    onError = Color(0xFF090B0C),
    errorContainer = Color(0xFF442022),
    onErrorContainer = Color(0xFFFF6467),
    background = Color(0xFF090B0C),
    onBackground = Color(0xFFF9FBFB),
    surface = Color(0xFF090B0C),
    onSurface = Color(0xFFF9FBFB),
    surfaceVariant = Color(0xFF22292B),
    onSurfaceVariant = Color(0xFF9CA8AB),
    surfaceTint = Color(0xFF090B0C),
    inverseSurface = Color(0xFFF9FBFB),
    inverseOnSurface = Color(0xFF090B0C),
    outline = Color(0xFF67787C),
    outlineVariant = Color(0xFF222324),
    scrim = Color(0xFF000000),
    surfaceContainerLowest = Color(0xFF090B0C),
    surfaceContainerLow = Color(0xFF101314),
    surfaceContainer = Color(0xFF161B1D),
    surfaceContainerHigh = Color(0xFF1C2223),
    surfaceContainerHighest = Color(0xFF22292B),
    surfaceDim = Color(0xFF090B0C),
    surfaceBright = Color(0xFF22292B),
)
```

## Typography

Compose renders one `FontFamily` per text and falls back to the system font for missing glyphs — it cannot chain Inter → Pretendard the way CSS does. So on Android:

- **UI and headings: Pretendard alone** (its Latin is Inter-based, so it matches the web). Bundle the official static OTFs (Regular, Medium, SemiBold, Bold) in `res/font/`; renaming the *files* to Android's lowercase resource names is fine, the font name stays Pretendard.
- **Identifiers and code: JetBrains Mono.** Hangul inside it falls back to the system font, so keep mono to Latin content.
- Set `letterSpacing = 0.sp` everywhere (M3's default tracking is not in this system); headings keep their negative tracking.

| M3 style | System style | Size / line | Weight |
|---|---|---|---|
| `headlineMedium` | `heading-2xl` | 30 / 36 sp | 600, −0.02em |
| `headlineSmall` | `heading-xl` | 24 / 32 sp | 600, −0.01em |
| `titleLarge` | `heading-lg` | 18 / 28 sp | 500 |
| `titleMedium` | `heading-md` | 16 / 24 sp | 500 |
| `titleSmall`, `labelLarge` | `label` | 14 / 20 sp | 500 |
| `bodyLarge` | `body-lg` | 16 / 24 sp | 400 |
| `bodyMedium` | `body` | 14 / 20 sp | 400 |
| `bodySmall` | `caption-regular` | 12 / 16 sp | 400 |
| `labelMedium`, `labelSmall` | `caption` | 12 / 16 sp | 500 |

`display*` and `headlineLarge` are unused; leave them at M3 defaults with the Pretendard family.

## Shapes

```kotlin
val PatinaShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),  // radius-sm: checkbox, snackbar
    small = RoundedCornerShape(8.dp),       // radius: buttons, text fields, chips
    medium = RoundedCornerShape(12.dp),     // radius-2xl: menus, popovers
    large = RoundedCornerShape(16.dp),      // radius-3xl: cards
    extraLarge = RoundedCornerShape(16.dp), // radius-3xl: dialogs, bottom sheets
)
```

M3 components pick different slots than this system, so pass shapes explicitly: buttons `shape = MaterialTheme.shapes.small` (M3 defaults to a pill; the pill stays the opt-in `CircleShape`), `OutlinedTextField` `shapes.small`, `Card` `shapes.large`, `DropdownMenu` `shapes.medium` with full-width items as on the web.

## Density, icons, motion

- Use the **comfortable** scale; never the desktop `compact-*` sizes. Every touch target is at least 48 dp even when the control draws at 36 dp.
- **Icons: Phosphor.** The Android library ships the icons it draws as `PatinaIcons` (`ImageVector`s built from the official SVGs, `@phosphor-icons/core`, MIT); import any other icon the same way, as a vector drawable through Android Studio's Vector Asset tool. Tint with `LocalContentColor`. Do not mix in Material Icons.
- Motion as on the web: 150 ms color transitions, no decorative animation.
- Ship `assets/Licenses/Pretendard-OFL.txt`, `JetBrainsMono-OFL.txt` and `Phosphor-MIT.txt` in the app's open-source licenses screen.
