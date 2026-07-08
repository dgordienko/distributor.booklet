package com.distributor.presenter.ui.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

private val PresenterColorScheme = darkColorScheme(
    primary = PresenterPrimary,
    onPrimary = PresenterOnColor,
    secondary = PresenterSecondary,
    onSecondary = PresenterOnColor,
    tertiary = PresenterTertiary,
    onTertiary = PresenterOnColor,
    background = GradientMid,
    onBackground = PresenterOnColor,
    surface = GlassSurface,
    onSurface = PresenterOnColor,
    surfaceVariant = GlassSurface,
    onSurfaceVariant = MutedOnBackground,
    outline = GlassBorder,
)

// Единый градиентный фон буклета вместо разных цветов на каждой странице.
val PresenterBackgroundBrush = Brush.verticalGradient(
    colors = listOf(GradientTop, GradientMid, GradientBottom),
)

@Composable
fun PresenterTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = PresenterColorScheme,
        typography = PresenterTypography,
        content = content,
    )
}

@Composable
fun PresenterBackground(content: @Composable () -> Unit) {
    Box(Modifier.fillMaxSize().background(PresenterBackgroundBrush)) {
        content()
    }
}

// "Glass" — базовая поверхность карточек по дизайн-документу: полупрозрачный
// белый фон + тонкая белая обводка поверх градиентного фона.
fun Modifier.glassCard(radius: Dp = 16.dp): Modifier = this
    .clip(RoundedCornerShape(radius))
    .background(GlassSurface)
    .border(1.dp, GlassBorder, RoundedCornerShape(radius))
