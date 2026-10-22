package patina.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import patina.theme.PatinaIcons
import patina.theme.PatinaSize
import patina.theme.PatinaSpace
import patina.theme.PatinaTheme

/**
 * A trigger that looks like a [PatinaTextField] (`control` fill, 40dp, radius `radius`, a caret) and opens a
 * [PatinaDropdownMenu]-styled list under itself. The chosen option shows a trailing check; with nothing chosen
 * ([selectedIndex] null) the trigger shows [placeholder]. Use it for four to fifteen options; for fewer use
 * [PatinaTabs] or radio buttons. The [label] sits above the field, as in the text field.
 */
@Suppress("LongParameterList", "LongMethod")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatinaSelect(
    options: List<String>,
    selectedIndex: Int?,
    onSelectedChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null,
    enabled: Boolean = true,
    isError: Boolean = false,
) {
    val scheme = MaterialTheme.colorScheme
    val colors = PatinaTheme.colors
    var expanded by remember { mutableStateOf(false) }
    val chosen = selectedIndex?.let { options.getOrNull(it) }
    val outline =
        when {
            isError -> scheme.error
            expanded -> scheme.outline
            else -> Color.Transparent
        }
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(PatinaSpace.space2)) {
        if (label != null) {
            Text(text = label, style = MaterialTheme.typography.labelLarge, color = scheme.onSurface)
        }
        ExposedDropdownMenuBox(expanded = expanded && enabled, onExpandedChange = { expanded = it }) {
            Row(
                modifier =
                    Modifier
                        .menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable, enabled)
                        .fillMaxWidth()
                        .alpha(if (enabled) 1f else DISABLED_ALPHA)
                        .heightIn(min = PatinaSize.controlLg)
                        .background(colors.control, MaterialTheme.shapes.small)
                        .border(PatinaStroke.ring, outline, MaterialTheme.shapes.small)
                        .padding(horizontal = PatinaSpace.space3),
                horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space1_5),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = chosen ?: placeholder.orEmpty(),
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.bodyLarge,
                    color = if (chosen != null) scheme.onSurface else scheme.onSurfaceVariant,
                )
                Icon(
                    PatinaIcons.CaretDown,
                    contentDescription = null,
                    modifier = Modifier.size(PatinaSize.iconMd),
                    tint = scheme.onSurfaceVariant,
                )
            }
            ExposedDropdownMenu(
                expanded = expanded && enabled,
                onDismissRequest = { expanded = false },
                shape = MaterialTheme.shapes.medium,
                containerColor = colors.popover,
                tonalElevation = 0.dp,
                shadowElevation = SELECT_ELEVATION,
                border = BorderStroke(PatinaStroke.hairline, scheme.outlineVariant),
            ) {
                options.forEachIndexed { index, option ->
                    DropdownMenuItem(
                        text = { Text(text = option, style = MaterialTheme.typography.labelLarge) },
                        onClick = {
                            onSelectedChange(index)
                            expanded = false
                        },
                        trailingIcon =
                            if (index == selectedIndex) {
                                {
                                    Icon(
                                        PatinaIcons.Check,
                                        contentDescription = null,
                                        modifier = Modifier.size(PatinaSize.iconMd),
                                    )
                                }
                            } else {
                                null
                            },
                        colors =
                            MenuDefaults.itemColors(
                                textColor = colors.onPopover,
                                trailingIconColor = colors.onPopover,
                            ),
                    )
                }
            }
        }
    }
}

private val SELECT_ELEVATION = 4.dp
