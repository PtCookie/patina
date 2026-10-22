package patina.ui

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import patina.theme.PatinaTheme

/**
 * An on/off switch. On is the `primary` track; off is the `control-strong` fill. The thumb is `background` in light
 * mode and `foreground` in dark mode so it stays visible on the track. It keeps the Material size (52x32dp) for
 * the touch target, where the web switch is 44x20.
 */
@Composable
fun PatinaSwitch(
    checked: Boolean,
    onCheckedChange: ((Boolean) -> Unit)?,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    val scheme = MaterialTheme.colorScheme
    val light = scheme.background.luminance() > LIGHT_BACKGROUND
    val thumbOff = if (light) scheme.surface else scheme.onSurface
    val off = PatinaTheme.colors.controlStrong
    val colors = SwitchDefaults.colors(
        checkedThumbColor = scheme.onPrimary,
        checkedTrackColor = scheme.primary,
        checkedBorderColor = scheme.primary,
        uncheckedThumbColor = thumbOff,
        uncheckedTrackColor = off,
        uncheckedBorderColor = off,
        disabledCheckedThumbColor = scheme.onPrimary,
        disabledCheckedTrackColor = scheme.primary,
        disabledCheckedBorderColor = scheme.primary,
        disabledUncheckedThumbColor = thumbOff,
        disabledUncheckedTrackColor = off,
        disabledUncheckedBorderColor = off
    )
    Switch(
        checked = checked,
        onCheckedChange = onCheckedChange,
        modifier = modifier.alpha(if (enabled) 1f else DISABLED_ALPHA),
        enabled = enabled,
        colors = colors
    )
}

/** A radio button: `primary` when selected, the `ring` outline when not. */
@Composable
fun PatinaRadioButton(
    selected: Boolean,
    onClick: (() -> Unit)?,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    val scheme = MaterialTheme.colorScheme
    RadioButton(
        selected = selected,
        onClick = onClick,
        modifier = modifier.alpha(if (enabled) 1f else DISABLED_ALPHA),
        enabled = enabled,
        colors = RadioButtonDefaults.colors(
            selectedColor = scheme.primary,
            unselectedColor = scheme.outline,
            disabledSelectedColor = scheme.primary,
            disabledUnselectedColor = scheme.outline
        )
    )
}

/**
 * A toggle chip for choosing several items from a short set, such as days of the week: `radius` corners, a
 * `border` hairline when off, the `secondary` fill when on.
 */
@Suppress("LongParameterList")
@Composable
fun PatinaFilterChip(
    selected: Boolean,
    onClick: () -> Unit,
    label: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    interactionSource: MutableInteractionSource? = null
) {
    val scheme = MaterialTheme.colorScheme
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = label,
        modifier = modifier.alpha(if (enabled) 1f else DISABLED_ALPHA),
        enabled = enabled,
        shape = MaterialTheme.shapes.small,
        colors = FilterChipDefaults.filterChipColors(
            containerColor = Color.Transparent,
            labelColor = scheme.onSurface,
            selectedContainerColor = scheme.secondaryContainer,
            selectedLabelColor = scheme.onSecondaryContainer,
            disabledContainerColor = Color.Transparent,
            disabledLabelColor = scheme.onSurface,
            disabledSelectedContainerColor = scheme.secondaryContainer
        ),
        border = FilterChipDefaults.filterChipBorder(
            enabled = enabled,
            selected = selected,
            borderColor = scheme.outlineVariant,
            selectedBorderColor = Color.Transparent,
            disabledBorderColor = scheme.outlineVariant,
            disabledSelectedBorderColor = Color.Transparent,
            borderWidth = PatinaStroke.hairline,
            selectedBorderWidth = PatinaStroke.hairline
        ),
        interactionSource = interactionSource
    )
}
