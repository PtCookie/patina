package patina.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import patina.theme.PatinaIcons
import patina.theme.PatinaSize
import patina.theme.PatinaSpace
import patina.theme.PatinaTheme

/**
 * A checkbox with an optional [label] to its right: a 20dp square with `radius-sm` corners, filled with
 * `control-strong` when off and `primary` with an `onPrimary` check when on (the web box is 16px; the extra 4dp is
 * for the thumb). The whole row is one 48dp touch target. [isError] draws the `error` outline. For a setting that
 * applies immediately use [PatinaSwitch].
 */
@Suppress("LongParameterList")
@Composable
fun PatinaCheckbox(
    checked: Boolean,
    onCheckedChange: ((Boolean) -> Unit)?,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isError: Boolean = false,
    label: String? = null,
) {
    val scheme = MaterialTheme.colorScheme
    val toggle =
        if (onCheckedChange != null) {
            Modifier.toggleable(
                value = checked,
                enabled = enabled,
                role = Role.Checkbox,
                onValueChange = onCheckedChange,
            )
        } else {
            Modifier
        }
    Row(
        modifier = modifier.alpha(if (enabled) 1f else DISABLED_ALPHA).then(toggle).minimumInteractiveComponentSize(),
        horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space2),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier =
                Modifier
                    .size(PatinaSize.iconLg)
                    .background(
                        if (checked) scheme.primary else PatinaTheme.colors.controlStrong,
                        MaterialTheme.shapes.extraSmall,
                    ).border(
                        PatinaStroke.ring,
                        if (isError) scheme.error else Color.Transparent,
                        MaterialTheme.shapes.extraSmall,
                    ),
            contentAlignment = Alignment.Center,
        ) {
            if (checked) {
                Icon(
                    PatinaIcons.Check,
                    contentDescription = null,
                    modifier = Modifier.size(PatinaSize.iconMd),
                    tint = scheme.onPrimary,
                )
            }
        }
        if (label != null) {
            Text(text = label, style = MaterialTheme.typography.bodyLarge, color = scheme.onSurface)
        }
    }
}
