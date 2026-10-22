@file:Suppress("MatchingDeclarationName")

package patina.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import patina.theme.PatinaSize
import patina.theme.PatinaSpace
import patina.theme.PatinaTheme

enum class PatinaBadgeVariant { Primary, Secondary, Outline, Destructive, Success, Warning, Info }

/**
 * One or two words of status or metadata: a pill 20dp tall with `caption` text. Status variants are a tint with
 * their colour as text, never a solid fill, and should always carry an [icon] (12dp): success, primary and
 * destructive differ by hue only, so a status is never colour alone.
 */
@Composable
fun PatinaBadge(
    text: String,
    modifier: Modifier = Modifier,
    variant: PatinaBadgeVariant = PatinaBadgeVariant.Primary,
    icon: ImageVector? = null
) {
    val scheme = MaterialTheme.colorScheme
    val colors = PatinaTheme.colors
    val (container, content) = when (variant) {
        PatinaBadgeVariant.Primary -> scheme.primary to scheme.onPrimary
        PatinaBadgeVariant.Secondary -> scheme.secondaryContainer to scheme.onSecondaryContainer
        PatinaBadgeVariant.Outline -> Color.Transparent to scheme.onSurface
        PatinaBadgeVariant.Destructive -> scheme.errorContainer to scheme.error
        PatinaBadgeVariant.Success -> colors.successContainer to colors.success
        PatinaBadgeVariant.Warning -> colors.warningContainer to colors.warning
        PatinaBadgeVariant.Info -> scheme.tertiaryContainer to scheme.tertiary
    }
    Surface(
        modifier = modifier,
        shape = CircleShape,
        color = container,
        contentColor = content,
        border = if (variant == PatinaBadgeVariant.Outline) {
            BorderStroke(PatinaStroke.hairline, scheme.outlineVariant)
        } else {
            null
        }
    ) {
        Row(
            modifier = Modifier.height(BADGE_HEIGHT).padding(horizontal = PatinaSpace.space2),
            horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space1),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (icon != null) {
                Icon(icon, contentDescription = null, modifier = Modifier.size(PatinaSize.iconSm))
            }
            Text(text = text, style = MaterialTheme.typography.labelSmall)
        }
    }
}

private val BADGE_HEIGHT = 20.dp
