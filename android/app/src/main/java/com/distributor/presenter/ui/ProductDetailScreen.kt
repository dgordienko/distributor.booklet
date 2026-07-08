package com.distributor.presenter.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.distributor.presenter.data.Product
import com.distributor.presenter.data.ProductApi
import com.distributor.presenter.ui.theme.glassCard
import java.util.Locale

@Composable
fun ProductDetailScreen(product: Product, onBack: () -> Unit) {
    val orderedPhotos = remember(product) {
        listOfNotNull(product.primaryPhoto) + product.photos.filter { it.id != product.primaryPhoto?.id }
    }
    val subtitle = listOf(product.manufacturer, product.trademark, product.productType)
        .filter { it.isNotBlank() }
        .joinToString(" · ")

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
    ) {
        TextButton(onClick = onBack) { Text("← Назад к товарам") }
        Spacer(Modifier.height(16.dp))
        Text(product.name, style = MaterialTheme.typography.headlineLarge)
        if (subtitle.isNotBlank()) {
            Text(
                subtitle,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        if (product.basePrice > 0) {
            Text(
                text = String.format(Locale.getDefault(), "%.2f %s", product.basePrice, product.currency),
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.primary,
            )
        }
        Spacer(Modifier.height(16.dp))
        if (orderedPhotos.isNotEmpty()) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(orderedPhotos) { photo ->
                    AsyncImage(
                        model = ProductApi.photoUrl(photo = photo),
                        contentDescription = product.name,
                        modifier = Modifier.size(220.dp).clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop,
                    )
                }
            }
            Spacer(Modifier.height(16.dp))
        }
        HtmlText(html = product.description, style = MaterialTheme.typography.bodyLarge)

        val hasSpecs = product.shelfLife.isNotBlank() ||
            product.storageTemperature.isNotBlank() ||
            product.composition.isNotBlank()
        if (hasSpecs) {
            Spacer(Modifier.height(16.dp))
            Column(
                Modifier.glassCard(16.dp).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                if (product.shelfLife.isNotBlank()) {
                    ProductSpecRow(label = "Термін зберігання товару", value = product.shelfLife)
                }
                if (product.storageTemperature.isNotBlank()) {
                    ProductSpecRow(label = "Температура зберігання", value = product.storageTemperature)
                }
                if (product.composition.isNotBlank()) {
                    ProductSpecRow(label = "Склад", value = product.composition)
                }
            }
        }
    }
}

@Composable
private fun ProductSpecRow(label: String, value: String) {
    Column {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(text = value, style = MaterialTheme.typography.bodyMedium)
    }
}
