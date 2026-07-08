package com.distributor.presenter.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.distributor.presenter.data.Product
import com.distributor.presenter.data.ProductApi
import com.distributor.presenter.ui.theme.glassCard

// Ниже этой ширины 3 колонки делают плитки нечитаемыми (обрезанные фото/текст) —
// это порог примерно между портретной и альбомной шириной планшета.
private val NARROW_WIDTH_BREAKPOINT = 1000.dp
private const val COLUMNS_WIDE = 3
private const val COLUMNS_NARROW = 2

@Composable
fun CatalogGridPage(products: List<Product>, onProductClick: (Int) -> Unit) {
    BoxWithConstraints(Modifier.fillMaxSize().padding(24.dp)) {
        val columns = if (maxWidth < NARROW_WIDTH_BREAKPOINT) COLUMNS_NARROW else COLUMNS_WIDE
        Column(Modifier.fillMaxSize()) {
            products.chunked(columns).forEach { row ->
                Row(Modifier.fillMaxWidth().weight(1f)) {
                    row.forEach { product ->
                        ProductThumbnail(
                            product = product,
                            modifier = Modifier.weight(1f).fillMaxHeight().padding(8.dp),
                            onClick = { onProductClick(product.id) },
                        )
                    }
                    repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }
    }
}

@Composable
private fun ProductThumbnail(product: Product, modifier: Modifier, onClick: () -> Unit) {
    Column(
        modifier
            .glassCard(16.dp)
            .clickable(onClick = onClick)
            .padding(12.dp),
    ) {
        product.primaryPhoto?.let { photo ->
            AsyncImage(
                model = ProductApi.photoUrl(photo = photo),
                contentDescription = product.name,
                modifier = Modifier.fillMaxWidth().weight(1f),
                contentScale = ContentScale.Crop,
            )
        }
        Text(
            text = product.name,
            style = MaterialTheme.typography.titleMedium,
            maxLines = 2,
        )
    }
}
