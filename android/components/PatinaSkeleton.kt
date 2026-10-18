package patina.ui

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Shape

/**
 * A `muted` placeholder shaped like the content that is loading: size it with [modifier] to the real content (text
 * lines 14dp tall, blocks at `radius`, avatars as circles by passing `CircleShape`). It pulses once every two
 * seconds. Mirror the final layout so nothing jumps when data arrives; never put text inside a skeleton, and show it
 * only after about 300ms of waiting.
 */
@Composable
fun PatinaSkeleton(modifier: Modifier = Modifier, shape: Shape = MaterialTheme.shapes.small) {
    val pulse by rememberInfiniteTransition(label = "skeleton").animateFloat(
        initialValue = 1f,
        targetValue = PULSE_LOW,
        animationSpec = infiniteRepeatable(tween(durationMillis = PULSE_HALF_MS), RepeatMode.Reverse),
        label = "skeleton alpha",
    )
    Box(modifier = modifier.alpha(pulse).background(MaterialTheme.colorScheme.surfaceVariant, shape))
}

private const val PULSE_LOW = 0.5f
private const val PULSE_HALF_MS = 1000
