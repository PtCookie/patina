package patina.ui

import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.size
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import patina.theme.PatinaIcons
import patina.theme.PatinaSize

/**
 * The screen title bar on the `background`, with an optional back button. The title is `heading-lg` (18sp). Give
 * [backDescription] the localized label of the back action.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatinaTopAppBar(
    title: String,
    modifier: Modifier = Modifier,
    onBack: (() -> Unit)? = null,
    backDescription: String = "Back",
    actions: @Composable RowScope.() -> Unit = {},
) {
    val scheme = MaterialTheme.colorScheme
    TopAppBar(
        title = { Text(text = title, style = MaterialTheme.typography.titleLarge) },
        modifier = modifier,
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = PatinaIcons.ArrowLeft,
                        contentDescription = backDescription,
                        modifier = Modifier.size(PatinaSize.iconLg),
                    )
                }
            }
        },
        actions = actions,
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = scheme.background,
            scrolledContainerColor = scheme.background,
            titleContentColor = scheme.onBackground,
            navigationIconContentColor = scheme.onBackground,
            actionIconContentColor = scheme.onBackground,
        ),
    )
}
