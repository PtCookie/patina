package patina.ui

import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * A 1dp `border` hairline that fills the width of its parent. Use it to divide groups inside one surface; between
 * whole sections use spacing instead.
 */
@Composable
fun PatinaDivider(modifier: Modifier = Modifier) {
    HorizontalDivider(
        modifier = modifier,
        thickness = PatinaStroke.hairline,
        color = MaterialTheme.colorScheme.outlineVariant,
    )
}
