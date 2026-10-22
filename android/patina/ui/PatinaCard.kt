@file:Suppress("MatchingDeclarationName")

package patina.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import patina.theme.PatinaSpace
import patina.theme.PatinaTheme

enum class PatinaCardSize { Default, Small }

/**
 * A `card` surface with `radius-3xl`, a hairline `border` ring and a 2dp shadow. Padding and the gap between
 * children are `space-6` (`space-4` for [PatinaCardSize.Small]). Pass [onClick] when the whole card is one target.
 * Do not nest cards: divide inside one with a hairline.
 */
@Composable
fun PatinaCard(
    modifier: Modifier = Modifier,
    size: PatinaCardSize = PatinaCardSize.Default,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val spacing: Dp = if (size == PatinaCardSize.Small) PatinaSpace.space4 else PatinaSpace.space6
    val colors =
        CardDefaults.cardColors(
            containerColor = PatinaTheme.colors.card,
            contentColor = PatinaTheme.colors.onCard,
        )
    val elevation = CardDefaults.cardElevation(defaultElevation = CARD_ELEVATION)
    val border = BorderStroke(PatinaStroke.hairline, MaterialTheme.colorScheme.outlineVariant)
    val inner: @Composable ColumnScope.() -> Unit = {
        Column(
            modifier = Modifier.padding(spacing),
            verticalArrangement = Arrangement.spacedBy(spacing),
            content = content,
        )
    }
    if (onClick != null) {
        Card(
            onClick = onClick,
            modifier = modifier,
            shape = MaterialTheme.shapes.large,
            colors = colors,
            elevation = elevation,
            border = border,
            content = inner,
        )
    } else {
        Card(
            modifier = modifier,
            shape = MaterialTheme.shapes.large,
            colors = colors,
            elevation = elevation,
            border = border,
            content = inner,
        )
    }
}

private val CARD_ELEVATION = 2.dp
