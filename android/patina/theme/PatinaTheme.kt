package patina.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.text.font.FontFamily

/** Code and identifier text styles, read through [PatinaTheme.code]. */
val LocalPatinaCode = staticCompositionLocalOf { patinaCodeStyles(FontFamily.Monospace) }

/**
 * The Patina theme: the static Material 3 scheme (never Material You dynamic colour), the type scale, the shape
 * scale and the extra colours in [PatinaColors]. Pass the resolved dark flag so an app-level light/dark override
 * wins over the system setting.
 *
 * [uiFont] should be Pretendard built from the official static OTFs (Compose cannot chain Inter and Pretendard);
 * [monoFont] is JetBrains Mono for identifiers. Both fall back to the system fonts.
 */
@Composable
fun PatinaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    uiFont: FontFamily = FontFamily.Default,
    monoFont: FontFamily = FontFamily.Monospace,
    content: @Composable () -> Unit
) {
    val extension = if (darkTheme) PatinaDarkExtension else PatinaLightExtension
    val typography = remember(uiFont) { patinaTypography(uiFont) }
    val code = remember(monoFont) { patinaCodeStyles(monoFont) }
    CompositionLocalProvider(LocalPatinaColors provides extension, LocalPatinaCode provides code) {
        MaterialTheme(
            colorScheme = if (darkTheme) PatinaDark else PatinaLight,
            typography = typography,
            shapes = PatinaShapes,
            content = content
        )
    }
}

/** Access to what Material 3 has no slot for. Colour roles themselves come from `MaterialTheme.colorScheme`. */
object PatinaTheme {
    /** Status, card, popover and control colours for the current theme. */
    val colors: PatinaColors
        @Composable @ReadOnlyComposable
        get() = LocalPatinaColors.current

    /** `mono` and `monoSmall` text styles for SHAs, paths and other identifiers. */
    val code: PatinaCodeStyles
        @Composable @ReadOnlyComposable
        get() = LocalPatinaCode.current
}
