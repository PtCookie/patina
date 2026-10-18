package net.ptcookie.patina.gallery

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import patina.theme.PatinaIcons
import patina.theme.PatinaSize
import patina.theme.PatinaSpace
import patina.theme.PatinaTheme
import patina.ui.PatinaAlertDialog
import patina.ui.PatinaBadge
import patina.ui.PatinaBadgeVariant
import patina.ui.PatinaButton
import patina.ui.PatinaButtonVariant
import patina.ui.PatinaCard
import patina.ui.PatinaCardSize
import patina.ui.PatinaFilterChip
import patina.ui.PatinaListItem
import patina.ui.PatinaRadioButton
import patina.ui.PatinaSwitch
import patina.ui.PatinaTextField
import patina.ui.PatinaTopAppBar

/**
 * Every tier 1 component in one scrolling screen, in light and dark, for visual review on an emulator
 * (see AGENTS.md, "Android library"). The first switch flips the theme; the `dark` intent extra starts it dark.
 */
class GalleryActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var dark by rememberSaveable { mutableStateOf(intent.getBooleanExtra("dark", false)) }
            // The system bar icons follow the resolved theme, not the system setting.
            SideEffect {
                val bars = SystemBarStyle.auto(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT) { dark }
                enableEdgeToEdge(statusBarStyle = bars, navigationBarStyle = bars)
            }
            PatinaTheme(darkTheme = dark) {
                Scaffold(
                    containerColor = MaterialTheme.colorScheme.background,
                    topBar = { PatinaTopAppBar(title = "Patina", onBack = {}) },
                ) { padding ->
                    Gallery(dark = dark, onDarkChange = { dark = it }, modifier = Modifier.padding(padding))
                }
            }
        }
    }
}

@Composable
private fun Gallery(dark: Boolean, onDarkChange: (Boolean) -> Unit, modifier: Modifier = Modifier) {
    var relay by rememberSaveable { mutableStateOf(true) }
    var theme by rememberSaveable { mutableStateOf("System") }
    var days by rememberSaveable { mutableStateOf(setOf("Mon", "Wed")) }
    var token by rememberSaveable { mutableStateOf("") }
    var show by rememberSaveable { mutableStateOf(false) }
    var dialog by rememberSaveable { mutableStateOf(false) }

    Column(
        modifier = modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(PatinaSpace.space4),
        verticalArrangement = Arrangement.spacedBy(PatinaSpace.space4),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space3)) {
            PatinaSwitch(checked = dark, onCheckedChange = onDarkChange)
            Text("Dark theme")
        }

        Section("Buttons")
        FlowRow(horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space2), verticalArrangement = Arrangement.spacedBy(PatinaSpace.space2)) {
            PatinaButton(onClick = {}) { Text("Commit") }
            PatinaButton(onClick = {}, variant = PatinaButtonVariant.Secondary) { Text("Secondary") }
            PatinaButton(onClick = {}, variant = PatinaButtonVariant.Outline) { Text("Outline") }
            PatinaButton(onClick = {}, variant = PatinaButtonVariant.Ghost) { Text("Ghost") }
            PatinaButton(onClick = {}, variant = PatinaButtonVariant.Destructive) { Text("Delete branch") }
            PatinaButton(onClick = {}, variant = PatinaButtonVariant.Link) { Text("Choose apps") }
            PatinaButton(onClick = {}, enabled = false) { Text("Disabled") }
            PatinaButton(onClick = {}, pill = true) { Text("Pill") }
            PatinaButton(onClick = {}, variant = PatinaButtonVariant.Outline, icon = PatinaIcons.Check) { Text("With icon") }
        }
        PatinaButton(onClick = {}, modifier = Modifier.fillMaxWidth(), enabled = false) { Text("Test connection") }

        Section("Badges")
        FlowRow(horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space2), verticalArrangement = Arrangement.spacedBy(PatinaSpace.space2)) {
            PatinaBadge("Default")
            PatinaBadge("Secondary", variant = PatinaBadgeVariant.Secondary)
            PatinaBadge("Outline", variant = PatinaBadgeVariant.Outline)
            PatinaBadge("Granted", variant = PatinaBadgeVariant.Success, icon = PatinaIcons.CheckCircle)
            PatinaBadge("Paused", variant = PatinaBadgeVariant.Warning, icon = PatinaIcons.Warning)
            PatinaBadge("Failed", variant = PatinaBadgeVariant.Destructive, icon = PatinaIcons.XCircle)
            PatinaBadge("Info", variant = PatinaBadgeVariant.Info, icon = PatinaIcons.Info)
        }

        Section("Text fields")
        PatinaTextField(value = "", onValueChange = {}, label = "Filter", placeholder = "Search apps")
        PatinaTextField(
            value = token,
            onValueChange = { token = it },
            label = "Bot token",
            placeholder = "Paste a token",
            supportingText = "A bot token is saved. Enter a new one to replace it.",
            visualTransformation = if (show) VisualTransformation.None else PasswordVisualTransformation(),
            trailing = {
                PatinaButton(onClick = { show = !show }, variant = PatinaButtonVariant.Link) { Text(if (show) "Hide" else "Show") }
            },
        )
        PatinaTextField(value = "bad name", onValueChange = {}, label = "Invalid", isError = true, supportingText = "Use letters only.")

        Section("Switch, radio and chips")
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space3)) {
            PatinaSwitch(checked = relay, onCheckedChange = { relay = it })
            PatinaSwitch(checked = !relay, onCheckedChange = { relay = !it })
            PatinaSwitch(checked = true, onCheckedChange = null, enabled = false)
        }
        Column {
            for (choice in listOf("System", "Light", "Dark")) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PatinaRadioButton(selected = theme == choice, onClick = { theme = choice })
                    Text(choice)
                }
            }
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space2)) {
            for (day in listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")) {
                PatinaFilterChip(
                    selected = day in days,
                    onClick = { days = if (day in days) days - day else days + day },
                    label = { Text(day) },
                )
            }
        }

        Section("Cards")
        PatinaCard(size = PatinaCardSize.Small, modifier = Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(PatinaSpace.space2)) {
                Text("Notification access", style = MaterialTheme.typography.titleMedium)
                PatinaBadge("Granted", variant = PatinaBadgeVariant.Success, icon = PatinaIcons.CheckCircle)
            }
            Text("The app can read posted notifications.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            PatinaButton(onClick = {}, variant = PatinaButtonVariant.Link) { Text("Choose apps") }
        }
        PatinaCard(modifier = Modifier.fillMaxWidth(), onClick = { dialog = true }) {
            Text("Default size, tap to open a dialog", style = MaterialTheme.typography.titleMedium)
            Text("Padding and gap are space-6.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        Section("List items")
        Column {
            PatinaListItem(
                headline = "Calendar",
                supporting = "com.google.android.calendar",
                leading = { Icon(PatinaIcons.Info, contentDescription = null, modifier = Modifier.size(PatinaSize.iconLg)) },
                trailing = { PatinaSwitch(checked = true, onCheckedChange = {}) },
            )
            PatinaListItem(
                headline = "Chrome",
                supporting = "com.android.chrome",
                leading = { Icon(PatinaIcons.Info, contentDescription = null, modifier = Modifier.size(PatinaSize.iconLg)) },
                trailing = { PatinaSwitch(checked = false, onCheckedChange = {}) },
            )
        }
    }

    if (dialog) {
        PatinaAlertDialog(
            onDismissRequest = { dialog = false },
            title = { Text("Turn relay off?") },
            text = { Text("3 queued messages will be deleted.") },
            confirmButton = {
                PatinaButton(onClick = { dialog = false }, variant = PatinaButtonVariant.Destructive) { Text("Turn off") }
            },
            dismissButton = {
                PatinaButton(onClick = { dialog = false }, variant = PatinaButtonVariant.Ghost) { Text("Cancel") }
            },
        )
    }
}

@Composable
private fun Section(title: String) {
    Text(text = title, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
}
