package com.distributor.presenter.ui.theme

import androidx.compose.ui.graphics.Color

// Palette из Platform-Capabilities-DESIGN.md — единая тема для всего буклета,
// т.к. это презентационное приложение и не должно "прыгать" по цветам между экранами.
val PresenterPrimary = Color(0xFF93C5FD)
val PresenterSecondary = Color(0xFF3B82F6)
val PresenterTertiary = Color(0xFFB29BFF)
val PresenterOnColor = Color(0xFFFFFFFF)

// Тёмный градиентный фон ("dark mode" + "glassy" framing из дизайн-документа).
val GradientTop = Color(0xFF0A2342)
val GradientMid = Color(0xFF1A4B82)
val GradientBottom = Color(0xFF4682B4)

// Стеклянная поверхность карточек: полупрозрачный белый + тонкая белая обводка.
val GlassSurface = Color.White.copy(alpha = 0.10f)
val GlassBorder = Color.White.copy(alpha = 0.20f)
val MutedOnBackground = Color.White.copy(alpha = 0.70f)
