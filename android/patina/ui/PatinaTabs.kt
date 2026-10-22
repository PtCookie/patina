package patina.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.semantics.Role
import patina.theme.PatinaSize
import patina.theme.PatinaSpace
import patina.theme.PatinaTheme

/**
 * A `muted` pill track (36dp, padding `space-1`) holding pill triggers; the selected trigger lifts onto the page
 * colour (`controlStrong` in dark mode, where the page is darker than the track). Inactive labels are
 * `muted-foreground`. Use two to five short [labels]; the panels they switch are yours: show the one that
 * [selectedIndex] names. The track keeps a 48dp touch target.
 */
@Composable
fun PatinaTabs(
    labels: List<String>,
    selectedIndex: Int,
    onSelectedChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    val scheme = MaterialTheme.colorScheme
    val light = scheme.background.luminance() > LIGHT_BACKGROUND
    val lifted = if (light) scheme.background else PatinaTheme.colors.controlStrong
    Row(
        modifier = modifier
            .alpha(if (enabled) 1f else DISABLED_ALPHA)
            .minimumInteractiveComponentSize()
            .background(scheme.surfaceVariant, CircleShape)
            .padding(PatinaSpace.space1)
            .selectableGroup(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        labels.forEachIndexed { index, label ->
            val selected = index == selectedIndex
            Box(
                modifier = Modifier
                    .height(PatinaSize.compactControl)
                    .clip(CircleShape)
                    .background(if (selected) lifted else Color.Transparent)
                    .selectable(
                        selected = selected,
                        enabled = enabled,
                        role = Role.Tab,
                        onClick = { onSelectedChange(index) },
                    )
                    .padding(horizontal = PatinaSpace.space3),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelLarge,
                    color = if (selected) scheme.onSurface else scheme.onSurfaceVariant,
                )
            }
        }
    }
}
