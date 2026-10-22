package patina.ui

import androidx.compose.foundation.clickable
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/**
 * A list row: an optional leading icon or image, a headline, an optional supporting line in `muted-foreground`
 * and an optional trailing control such as a [PatinaSwitch]. The row has no fill; divide rows with spacing.
 */
@Composable
fun PatinaListItem(
    headline: String,
    modifier: Modifier = Modifier,
    supporting: String? = null,
    leading: (@Composable () -> Unit)? = null,
    trailing: (@Composable () -> Unit)? = null,
    onClick: (() -> Unit)? = null,
) {
    val scheme = MaterialTheme.colorScheme
    ListItem(
        headlineContent = { Text(text = headline, style = MaterialTheme.typography.bodyLarge) },
        modifier = if (onClick != null) modifier.clickable(onClick = onClick) else modifier,
        supportingContent = supporting?.let { line ->
            { Text(text = line, style = MaterialTheme.typography.bodySmall) }
        },
        leadingContent = leading,
        trailingContent = trailing,
        colors = ListItemDefaults.colors(
            containerColor = Color.Transparent,
            headlineColor = scheme.onSurface,
            supportingColor = scheme.onSurfaceVariant,
        ),
        tonalElevation = 0.dp,
        shadowElevation = 0.dp,
    )
}
