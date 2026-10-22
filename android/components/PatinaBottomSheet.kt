package patina.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import patina.theme.PatinaSpace
import patina.theme.PatinaTheme

/**
 * A panel that slides up from the bottom edge over the dimmed screen: the `popover` surface (a step above the page
 * in dark mode, where the page is darker), `radius-3xl` corners, the system scrim. Padding is `space-6` and the gap
 * between children `space-4`. Close it before navigating away so the screen underneath is never left inert;
 * swiping down and tapping the scrim call [onDismissRequest].
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatinaBottomSheet(
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        modifier = modifier,
        shape = MaterialTheme.shapes.extraLarge,
        containerColor = PatinaTheme.colors.popover,
        contentColor = PatinaTheme.colors.onPopover,
        tonalElevation = 0.dp,
    ) {
        Column(
            modifier = Modifier.navigationBarsPadding().padding(PatinaSpace.space6),
            verticalArrangement = Arrangement.spacedBy(PatinaSpace.space4),
            content = content,
        )
    }
}
