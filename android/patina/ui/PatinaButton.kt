@file:Suppress("MatchingDeclarationName")

package patina.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.vector.ImageVector
import patina.theme.PatinaSize
import patina.theme.PatinaSpace

enum class PatinaButtonVariant { Primary, Secondary, Outline, Ghost, Destructive, Link }

/**
 * A 36dp button (`control-md`) with a 48dp touch target. [PatinaButtonVariant.Primary] is for the one main action
 * of a screen; Destructive is a tint, never a solid red fill; Link is emerald text for inline actions. The shape is
 * `radius` (8dp); [pill] is the opt-in fully rounded shape: apply it to a whole group or screen at once.
 * Disabled is 50% opacity for every variant.
 */
@Suppress("LongParameterList", "LongMethod")
@Composable
fun PatinaButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: PatinaButtonVariant = PatinaButtonVariant.Primary,
    enabled: Boolean = true,
    pill: Boolean = false,
    icon: ImageVector? = null,
    content: @Composable RowScope.() -> Unit,
) {
    val scheme = MaterialTheme.colorScheme
    val shape = if (pill) CircleShape else MaterialTheme.shapes.small
    val padding = PaddingValues(horizontal = PatinaSpace.space3)
    val sized = modifier.height(PatinaSize.controlMd).alpha(if (enabled) 1f else DISABLED_ALPHA)
    val body: @Composable RowScope.() -> Unit = {
        if (icon != null) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(PatinaSize.iconMd))
            Spacer(Modifier.width(PatinaSpace.space1_5))
        }
        content()
    }
    when (variant) {
        PatinaButtonVariant.Primary ->
            androidx.compose.material3.Button(
                onClick = onClick,
                modifier = sized,
                enabled = enabled,
                shape = shape,
                colors =
                    ButtonDefaults.buttonColors(
                        disabledContainerColor = scheme.primary,
                        disabledContentColor = scheme.onPrimary,
                    ),
                contentPadding = padding,
                content = body,
            )
        PatinaButtonVariant.Secondary ->
            FilledTonalButton(
                onClick = onClick,
                modifier = sized,
                enabled = enabled,
                shape = shape,
                colors =
                    ButtonDefaults.filledTonalButtonColors(
                        disabledContainerColor = scheme.secondaryContainer,
                        disabledContentColor = scheme.onSecondaryContainer,
                    ),
                contentPadding = padding,
                content = body,
            )
        PatinaButtonVariant.Outline ->
            OutlinedButton(
                onClick = onClick,
                modifier = sized,
                enabled = enabled,
                shape = shape,
                colors =
                    ButtonDefaults.outlinedButtonColors(
                        contentColor = scheme.onSurface,
                        disabledContentColor = scheme.onSurface,
                    ),
                border = BorderStroke(PatinaStroke.hairline, scheme.outlineVariant),
                contentPadding = padding,
                content = body,
            )
        PatinaButtonVariant.Ghost ->
            TextButton(
                onClick = onClick,
                modifier = sized,
                enabled = enabled,
                shape = shape,
                colors =
                    ButtonDefaults.textButtonColors(
                        contentColor = scheme.onSurface,
                        disabledContentColor = scheme.onSurface,
                    ),
                contentPadding = padding,
                content = body,
            )
        PatinaButtonVariant.Destructive ->
            FilledTonalButton(
                onClick = onClick,
                modifier = sized,
                enabled = enabled,
                shape = shape,
                colors =
                    ButtonDefaults.filledTonalButtonColors(
                        containerColor = scheme.errorContainer,
                        contentColor = scheme.error,
                        disabledContainerColor = scheme.errorContainer,
                        disabledContentColor = scheme.error,
                    ),
                contentPadding = padding,
                content = body,
            )
        PatinaButtonVariant.Link ->
            TextButton(
                onClick = onClick,
                modifier = sized,
                enabled = enabled,
                shape = shape,
                colors =
                    ButtonDefaults.textButtonColors(
                        contentColor = scheme.primary,
                        disabledContentColor = scheme.primary,
                    ),
                contentPadding = padding,
                content = body,
            )
    }
}
