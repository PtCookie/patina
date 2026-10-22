package patina.ui

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PlainTooltip
import androidx.compose.material3.Text
import androidx.compose.material3.TooltipAnchorPosition
import androidx.compose.material3.TooltipBox
import androidx.compose.material3.TooltipDefaults
import androidx.compose.material3.rememberTooltipState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * The inverted label of the design: `foreground` fill with `background` text, `radius-md` corners. On a phone it
 * opens on long press (and on hover or focus with a mouse or keyboard). Name the control or a truncated value in a
 * few words; never put essential information or interactive content only in a tooltip.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatinaTooltip(
    text: String,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    val scheme = MaterialTheme.colorScheme
    TooltipBox(
        positionProvider = TooltipDefaults.rememberTooltipPositionProvider(TooltipAnchorPosition.Above),
        tooltip = {
            PlainTooltip(
                shape = MaterialTheme.shapes.extraSmall,
                containerColor = scheme.inverseSurface,
                contentColor = scheme.inverseOnSurface,
            ) {
                Text(text = text, style = MaterialTheme.typography.bodySmall)
            }
        },
        state = rememberTooltipState(),
        modifier = modifier,
        content = content,
    )
}
