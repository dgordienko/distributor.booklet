@file:OptIn(ExperimentalTextApi::class)

package com.distributor.presenter.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.distributor.presenter.R

// Один файл переменного шрифта (res/font/inter_variable.ttf, лицензия SIL OFL,
// см. assets/licenses/Inter-OFL.txt) даёт все начертания через ось "wght" —
// не нужен рантайм-скачиваемый Google Fonts provider для офлайн-киоска.
private val InterVariable = FontFamily(
    Font(R.font.inter_variable, FontWeight.Thin, variationSettings = FontVariation.Settings(FontVariation.weight(100))),
    Font(R.font.inter_variable, FontWeight.ExtraLight, variationSettings = FontVariation.Settings(FontVariation.weight(200))),
    Font(R.font.inter_variable, FontWeight.Light, variationSettings = FontVariation.Settings(FontVariation.weight(300))),
    Font(R.font.inter_variable, FontWeight.Normal, variationSettings = FontVariation.Settings(FontVariation.weight(400))),
    Font(R.font.inter_variable, FontWeight.Medium, variationSettings = FontVariation.Settings(FontVariation.weight(500))),
    Font(R.font.inter_variable, FontWeight.SemiBold, variationSettings = FontVariation.Settings(FontVariation.weight(600))),
    Font(R.font.inter_variable, FontWeight.Bold, variationSettings = FontVariation.Settings(FontVariation.weight(700))),
)

// Шкала размеров/начертаний из Testimonials-Section-DESIGN.md: display-lg
// (700, uppercase, плотный трекинг) для героя-названия, body-md (500) для
// описания, label-md (600) для лейблов/бейджей — расширено на остальные
// слоты Material3 в том же духе, чтобы вся типографика была одной системой.
val PresenterTypography = Typography(
    displayLarge = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.Bold, fontSize = 44.sp, lineHeight = 46.sp, letterSpacing = (-1.5).sp),
    displayMedium = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.Bold, fontSize = 40.sp, lineHeight = 42.sp, letterSpacing = (-1.5).sp),
    displaySmall = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.Bold, fontSize = 34.sp, lineHeight = 36.sp, letterSpacing = (-1.2).sp),
    headlineLarge = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.Bold, fontSize = 36.sp, lineHeight = 40.sp, letterSpacing = (-0.9).sp),
    headlineMedium = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.SemiBold, fontSize = 28.sp, lineHeight = 34.sp),
    headlineSmall = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.SemiBold, fontSize = 24.sp, lineHeight = 30.sp),
    titleLarge = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.SemiBold, fontSize = 20.sp, lineHeight = 26.sp),
    titleMedium = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, lineHeight = 22.sp),
    titleSmall = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, lineHeight = 20.sp),
    bodyLarge = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.Medium, fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 22.75.sp),
    bodySmall = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.Medium, fontSize = 12.sp, lineHeight = 18.sp),
    labelLarge = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, lineHeight = 20.sp),
    labelMedium = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, lineHeight = 20.sp),
    labelSmall = TextStyle(fontFamily = InterVariable, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, lineHeight = 16.sp),
)
