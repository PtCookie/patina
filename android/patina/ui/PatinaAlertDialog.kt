package patina.ui

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ProvideTextStyle
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import patina.theme.PatinaTheme

/**
 * A modal dialog: the `popover` surface, `radius-3xl`, the `overlay` scrim, a `heading-md` title and muted body
 * text. Put at most one primary action in [confirmButton] and use a Ghost [PatinaButton] for [dismissButton].
 */
@Suppress("LongParameterList")
@Composable
fun PatinaAlertDialog(
    onDismissRequest: () -> Unit,
    confirmButton: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    dismissButton: (@Composable () -> Unit)? = null,
    title: (@Composable () -> Unit)? = null,
    text: (@Composable () -> Unit)? = null
) {
    val scheme = MaterialTheme.colorScheme
    val colors = PatinaTheme.colors
    AlertDialog(
        onDismissRequest = onDismissRequest,
        confirmButton = confirmButton,
        modifier = modifier,
        dismissButton = dismissButton,
        title = title?.let { content ->
            { ProvideTextStyle(MaterialTheme.typography.titleMedium) { content() } }
        },
        text = text?.let { content ->
            { ProvideTextStyle(MaterialTheme.typography.bodyMedium) { content() } }
        },
        shape = MaterialTheme.shapes.extraLarge,
        containerColor = colors.popover,
        titleContentColor = colors.onPopover,
        textContentColor = scheme.onSurfaceVariant,
        tonalElevation = 0.dp
    )
}
