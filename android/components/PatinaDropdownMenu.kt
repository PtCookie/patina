package patina.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import patina.theme.PatinaSize
import patina.theme.PatinaSpace
import patina.theme.PatinaTheme

/**
 * A solid menu: the opaque `popover` surface, `radius-2xl` corners, a hairline `border` and a small shadow, never
 * translucent. Rows run edge to edge and the menu clips them to its corners. Fill it with
 * [PatinaDropdownMenuItem], [PatinaDropdownMenuLabel] and [PatinaDropdownMenuDivider]; at most one destructive
 * item, last.
 */
@Composable
fun PatinaDropdownMenu(
    expanded: Boolean,
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    DropdownMenu(
        expanded = expanded,
        onDismissRequest = onDismissRequest,
        modifier = modifier,
        shape = MaterialTheme.shapes.medium,
        containerColor = PatinaTheme.colors.popover,
        tonalElevation = 0.dp,
        shadowElevation = MENU_ELEVATION,
        border = BorderStroke(PatinaStroke.hairline, MaterialTheme.colorScheme.outlineVariant),
        content = content,
    )
}

/** A menu row: an optional leading [icon] and a label. A [destructive] row is `error` text and icon. */
@Composable
fun PatinaDropdownMenuItem(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    destructive: Boolean = false,
    enabled: Boolean = true,
) {
    val scheme = MaterialTheme.colorScheme
    val content = if (destructive) scheme.error else PatinaTheme.colors.onPopover
    DropdownMenuItem(
        text = { Text(text = text, style = MaterialTheme.typography.labelLarge) },
        onClick = onClick,
        modifier = modifier.alpha(if (enabled) 1f else DISABLED_ALPHA),
        leadingIcon = icon?.let { vector ->
            { Icon(vector, contentDescription = null, modifier = Modifier.size(PatinaSize.iconMd)) }
        },
        enabled = enabled,
        colors = MenuDefaults.itemColors(
            textColor = content,
            leadingIconColor = content,
            trailingIconColor = content,
            disabledTextColor = content,
            disabledLeadingIconColor = content,
            disabledTrailingIconColor = content,
        ),
    )
}

/** A group label above a run of items: `muted-foreground`, small. */
@Composable
fun PatinaDropdownMenuLabel(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text,
        modifier = modifier.padding(start = PatinaSpace.space3, end = PatinaSpace.space3, top = PatinaSpace.space2, bottom = PatinaSpace.space1),
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}

/** A full-width `border` hairline with `space-1` above and below. */
@Composable
fun PatinaDropdownMenuDivider(modifier: Modifier = Modifier) {
    HorizontalDivider(
        modifier = modifier.padding(vertical = PatinaSpace.space1),
        thickness = PatinaStroke.hairline,
        color = MaterialTheme.colorScheme.outlineVariant,
    )
}

private val MENU_ELEVATION = 4.dp
