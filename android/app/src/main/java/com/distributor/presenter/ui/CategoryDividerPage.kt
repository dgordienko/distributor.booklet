package com.distributor.presenter.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.distributor.presenter.data.Category
import com.distributor.presenter.data.ProductApi
import com.distributor.presenter.ui.theme.PresenterMuted
import com.distributor.presenter.ui.theme.PresenterScrimBrush
import com.distributor.presenter.ui.theme.PresenterSurface
import com.distributor.presenter.ui.theme.PresenterSurfaceDeep
import com.distributor.presenter.ui.theme.presenterCard
import com.distributor.presenter.ui.theme.presenterPill
import java.util.Locale

// Та же раскладка, что и у карточки товара (ProductCarouselScreen): фото на
// весь экран + navy-скрим снизу + текст поверх слева внизу — разделитель
// категории больше не выбивается из общего стиля буклета.
@Composable
fun CategoryDividerPage(category: Category) {
    Box(Modifier.fillMaxSize().background(PresenterSurfaceDeep)) {
        if (category.imageUrl.isNotBlank()) {
            AsyncImage(
                model = ProductApi.resolveUrl(relativeUrl = category.imageUrl),
                contentDescription = category.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        } else {
            val fallbackGradient = Brush.verticalGradient(listOf(PresenterSurface, PresenterSurfaceDeep))
            Box(Modifier.fillMaxSize().background(fallbackGradient))
        }
        Box(Modifier.fillMaxSize().background(PresenterScrimBrush))

        Column(
            Modifier
                .fillMaxSize()
                .padding(horizontal = 40.dp, vertical = 48.dp),
            verticalArrangement = Arrangement.Bottom,
        ) {
            Column(Modifier.widthIn(max = 640.dp)) {
                Text(
                    text = "РОЗДІЛ КАТАЛОГУ",
                    color = PresenterSurfaceDeep,
                    style = MaterialTheme.typography.labelMedium,
                    modifier = Modifier.presenterPill().padding(horizontal = 14.dp, vertical = 6.dp),
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    text = category.name.uppercase(Locale.getDefault()),
                    color = Color.White,
                    style = MaterialTheme.typography.displaySmall,
                )
                if (category.description.isNotBlank()) {
                    Spacer(Modifier.height(12.dp))
                    Column(
                        Modifier
                            .heightIn(max = 260.dp)
                            .presenterCard(16.dp)
                            .padding(16.dp)
                            .verticalScroll(rememberScrollState()),
                    ) {
                        HtmlText(
                            html = category.description,
                            style = MaterialTheme.typography.bodyLarge.copy(color = PresenterMuted),
                        )
                    }
                }
            }
        }
    }
}
