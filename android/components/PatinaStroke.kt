package patina.ui

import androidx.compose.ui.unit.dp

/** Line widths that the design fixes without a token: hairlines and the 2dp focus ring. */
object PatinaStroke {
    val hairline = 1.dp
    val ring = 2.dp
}

/** Disabled controls are drawn at 50% opacity. */
internal const val DISABLED_ALPHA = 0.5f
