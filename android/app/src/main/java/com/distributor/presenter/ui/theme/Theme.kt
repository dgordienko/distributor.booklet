package com.distributor.presenter.ui.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

private val PresenterColorScheme = darkColorScheme(
    primary = PresenterAccent,
    onPrimary = PresenterSurfaceDeep,
    secondary = PresenterSurface,
    onSecondary = PresenterOnColor,
    tertiary = PresenterSurfaceDeep,
    onTertiary = PresenterOnColor,
    background = PresenterSurfaceDeep,
    onBackground = PresenterOnColor,
    surface = PresenterSurface,
    onSurface = PresenterOnColor,
    surfaceVariant = PresenterSurface,
    onSurfaceVariant = PresenterMuted,
    outline = PresenterMutedDim,
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
    Box(Modifier.fillMaxSize().background(PresenterSurfaceDeep)) {
        content()
    }
}

// Единая карточная поверхность буклета (обложка, разделитель категории,
// плитка товара в сетке) — полупрозрачный navy поверх фото/градиента,
// см. component "card" в Testimonials-Section-DESIGN.md.
fun Modifier.presenterCard(radius: Dp = 16.dp): Modifier = this
    .clip(RoundedCornerShape(radius))
    .background(PresenterSurface.copy(alpha = 0.55f))

// Пилюля-бейдж/CTA (цена, тип товара, подсказки навигации) — component
// "button-primary" из дизайн-токенов: акцентный фон, radius 9999px.
fun Modifier.presenterPill(): Modifier = this
    .clip(RoundedCornerShape(percent = 50))
    .background(PresenterAccent)

// Общий navy-скрим для полноэкранных фото-страниц (карточка товара,
// разделитель категории) — затемняет низ снимка, чтобы текст поверх
// оставался читаемым.
val PresenterScrimBrush = Brush.verticalGradient(
    colorStops = arrayOf(
        0.0f to Color.Transparent,
        0.45f to PresenterSurface.copy(alpha = 0.55f),
        1.0f to PresenterSurfaceDeep.copy(alpha = 0.92f),
    ),
)
