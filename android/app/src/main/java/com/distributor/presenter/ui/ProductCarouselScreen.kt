package com.distributor.presenter.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.distributor.presenter.data.Product
import com.distributor.presenter.data.ProductApi
import com.distributor.presenter.ui.theme.PresenterMuted
import com.distributor.presenter.ui.theme.PresenterMutedDim
import com.distributor.presenter.ui.theme.PresenterScrimBrush
import com.distributor.presenter.ui.theme.PresenterSurfaceDeep
import com.distributor.presenter.ui.theme.presenterCard
import com.distributor.presenter.ui.theme.presenterPill
import java.util.Locale

// Полноэкранная карточка товара: фото на весь экран + navy-затемнение снизу
// (Testimonials-Section-DESIGN.md) + текстовый блок слева внизу. Раскладка —
// из прототипа CatalogApp (Views/MainPage.xaml). Открывается из буклета
// (CatalogGridPage) на конкретном товаре, дальше можно пролистать соседние.
@Composable
fun ProductCarouselScreen(products: List<Product>, initialProductId: Int?, onBack: () -> Unit) {
    val startIndex = remember(products, initialProductId) {
        initialProductId?.let { id -> products.indexOfFirst { it.id == id } }?.takeIf { it >= 0 } ?: 0
    }
    val pagerState = rememberPagerState(initialPage = startIndex, pageCount = { products.size })

    Box(Modifier.fillMaxSize()) {
        HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
            ProductCarouselPage(product = products[page])
        }
        Text(
            text = "← Назад до буклету",
            color = Color.White,
            style = MaterialTheme.typography.labelMedium,
            modifier = Modifier
                .padding(24.dp)
                .presenterCard(999.dp)
                .clickable(onClick = onBack)
                .padding(horizontal = 16.dp, vertical = 10.dp),
        )
    }
}

@Composable
private fun ProductCarouselPage(product: Product) {
    Box(Modifier.fillMaxSize().background(PresenterSurfaceDeep)) {
        product.primaryPhoto?.let { photo ->
            AsyncImage(
                model = ProductApi.photoUrl(photo = photo),
                contentDescription = product.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        }
        Box(Modifier.fillMaxSize().background(PresenterScrimBrush))

        Column(
            Modifier
                .fillMaxSize()
                .padding(horizontal = 40.dp, vertical = 48.dp),
            verticalArrangement = Arrangement.Bottom,
        ) {
            Column(Modifier.widthIn(max = 640.dp)) {
                if (product.productType.isNotBlank()) {
                    Text(
                        text = product.productType.uppercase(Locale.getDefault()),
                        color = PresenterSurfaceDeep,
                        style = MaterialTheme.typography.labelMedium,
                        modifier = Modifier.presenterPill().padding(horizontal = 14.dp, vertical = 6.dp),
                    )
                    Spacer(Modifier.height(12.dp))
                }
                if (product.trademark.isNotBlank()) {
                    Text(
                        text = product.trademark,
                        color = Color.White,
                        style = MaterialTheme.typography.headlineSmall,
                    )
                }
                if (product.manufacturer.isNotBlank()) {
                    Text(
                        text = product.manufacturer,
                        color = PresenterMutedDim,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                Spacer(Modifier.height(12.dp))
                Text(
                    text = product.name.uppercase(Locale.getDefault()),
                    color = Color.White,
                    style = MaterialTheme.typography.displaySmall,
                )

                val specLines = listOfNotNull(
                    product.shelfLife.takeIf { it.isNotBlank() }?.let { "Термін зберігання: $it" },
                    product.storageTemperature.takeIf { it.isNotBlank() }?.let { "Температура зберігання: $it" },
                    product.composition.takeIf { it.isNotBlank() }?.let { "Склад: $it" },
                )
                if (product.description.isNotBlank() || specLines.isNotEmpty()) {
                    Spacer(Modifier.height(12.dp))
                    // Описание может быть длинным — держим карточку одного размера
                    // (тип/бренд/название/цена всегда видны), а сам текст скроллим.
                    Column(
                        Modifier
                            .heightIn(max = 260.dp)
                            .presenterCard(16.dp)
                            .padding(16.dp)
                            .verticalScroll(rememberScrollState()),
                    ) {
                        if (product.description.isNotBlank()) {
                            HtmlText(
                                html = product.description,
                                style = MaterialTheme.typography.bodyLarge.copy(color = PresenterMuted),
                            )
                        }
                        if (specLines.isNotEmpty()) {
                            Spacer(Modifier.height(8.dp))
                            specLines.forEach { line ->
                                Text(text = line, color = PresenterMutedDim, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }

                if (product.basePrice > 0) {
                    Spacer(Modifier.height(16.dp))
                    Text(
                        text = String.format(Locale.getDefault(), "%.2f %s", product.basePrice, product.currency),
                        color = PresenterSurfaceDeep,
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.presenterPill().padding(horizontal = 20.dp, vertical = 12.dp),
                    )
                }
            }
        }
    }
}
