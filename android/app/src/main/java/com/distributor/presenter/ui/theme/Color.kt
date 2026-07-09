package com.distributor.presenter.ui.theme

import androidx.compose.ui.graphics.Color

// Палитра из Testimonials-Section-DESIGN.md: тёмный режим с голубым акцентом
// (#38BDF8) поверх глубокого navy (#1E293B / #0F172A). Фото товара остаётся
// героем экрана — эти цвета красят только текст, бейджи и карточки поверх
// затемнения, а не сам снимок.
val PresenterAccent = Color(0xFF38BDF8) // colors.primary — акцент/CTA (цена)
val PresenterSurface = Color(0xFF1E293B) // colors.secondary — карточки, скрим
val PresenterSurfaceDeep = Color(0xFF0F172A) // colors.tertiary — низ скрима, текст на акценте
val PresenterOnColor = Color(0xFFFFFFFF) // colors.neutral / text-primary
val PresenterMuted = Color(0xFFE2E8F0) // colors.text-secondary
val PresenterMutedDim = Color(0xFF94A3B8) // приглушённый вариант text-secondary для мелких подписей
