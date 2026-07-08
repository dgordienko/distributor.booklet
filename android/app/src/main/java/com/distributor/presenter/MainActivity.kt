package com.distributor.presenter

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.distributor.presenter.ui.PresenterApp
import com.distributor.presenter.ui.theme.PresenterBackground
import com.distributor.presenter.ui.theme.PresenterOnColor
import com.distributor.presenter.ui.theme.PresenterTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = android.graphics.Color.TRANSPARENT
        window.navigationBarColor = android.graphics.Color.TRANSPARENT
        hideSystemBars()
        setContent {
            PresenterTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Transparent,
                    contentColor = PresenterOnColor,
                ) {
                    PresenterBackground {
                        PresenterApp()
                    }
                }
            }
        }
    }

    // Полноэкранный киоск-режим: строка состояния и навигация скрыты и в
    // портретной, и в альбомной ориентации; временно возвращаются свайпом
    // от края и снова прячутся. Переприменяем при возврате фокуса окну, т.к.
    // системные бары могут появиться заново после жестов/диалогов.
    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemBars()
        }
    }

    private fun hideSystemBars() {
        val insetsController = WindowCompat.getInsetsController(window, window.decorView)
        insetsController.isAppearanceLightStatusBars = false
        insetsController.isAppearanceLightNavigationBars = false
        insetsController.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        insetsController.hide(WindowInsetsCompat.Type.systemBars())
    }
}
