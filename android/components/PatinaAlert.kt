package patina.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import patina.theme.PatinaSize
import patina.theme.PatinaSpace
import patina.theme.PatinaTheme

enum class PatinaAlertVariant { Default, Destructive, Success, Warning, Info }

/**
 * An inline message: an [icon], a one-line [title], an optional [description] and an optional [action] (one
 * button, at the end), `radius-2xl` corners, padding `space-3` x `space-4`. Default and Destructive are the `card`
 * surface with a hairline `border`; Success, Warning and Info are their solid tint with the status colour on the icon
 * and title. Always pair the tone with an icon and a word, never colour alone.
 */
@Composable
fun PatinaAlert(
    title: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    variant: PatinaAlertVariant = PatinaAlertVariant.Default,
    description: String? = null,
    action: (@Composable () -> Unit)? = null,
) {
    val scheme = MaterialTheme.colorScheme
    val colors = PatinaTheme.colors
    val tinted = variant == PatinaAlertVariant.Success || variant == PatinaAlertVariant.Warning ||
        variant == PatinaAlertVariant.Info
    val container = when (variant) {
        PatinaAlertVariant.Success -> colors.successContainer
        PatinaAlertVariant.Warning -> colors.warningContainer
        PatinaAlertVariant.Info -> scheme.tertiaryContainer
        else -> colors.card
    }
    val tone = when (variant) {
        PatinaAlertVariant.Default -> colors.onCard
        PatinaAlertVariant.Destructive -> scheme.error
        PatinaAlertVariant.Success -> colors.success
        PatinaAlertVariant.Warning -> colors.warning
        PatinaAlertVariant.Info -> scheme.tertiary
    }
    val body = when {
        variant == PatinaAlertVariant.Destructive -> scheme.error
        tinted -> scheme.onSurface
        else -> scheme.onSurfaceVariant
    }
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        color = container,
        border = if (tinted) null else BorderStroke(PatinaStroke.hairline, scheme.outlineVariant),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = PatinaSpace.space4, vertical = PatinaSpace.space3),
            horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space3),
            verticalAlignment = Alignment.Top,
        ) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(PatinaSize.iconLg), tint = tone)
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(PatinaSpace.space1)) {
                Text(text = title, style = MaterialTheme.typography.labelLarge, color = tone)
                if (description != null) {
                    Text(text = description, style = MaterialTheme.typography.bodyMedium, color = body)
                }
            }
            action?.invoke()
        }
    }
}
