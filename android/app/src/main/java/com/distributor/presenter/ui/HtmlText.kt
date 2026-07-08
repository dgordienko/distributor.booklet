package com.distributor.presenter.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import com.distributor.presenter.util.htmlToBlocks

// Каждый абзац/пункт списка рендерится отдельным Text(), чтобы у каждого
// можно было независимо задать textAlign (см. util/Html.kt).
@Composable
fun HtmlText(
    html: String,
    modifier: Modifier = Modifier,
    style: TextStyle = LocalTextStyle.current,
) {
    val blocks = remember(html) { html.htmlToBlocks() }
    Column(modifier) {
        blocks.forEach { block ->
            Text(text = block.text, style = style, textAlign = block.align, modifier = Modifier.fillMaxWidth())
        }
    }
}
