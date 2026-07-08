package com.distributor.presenter.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.distributor.presenter.data.Category
import com.distributor.presenter.data.ProductApi
import com.distributor.presenter.ui.theme.glassCard

@Composable
fun CategoryDividerPage(category: Category) {
    Column(Modifier.fillMaxSize()) {
        if (category.imageUrl.isNotBlank()) {
            AsyncImage(
                model = ProductApi.resolveUrl(relativeUrl = category.imageUrl),
                contentDescription = category.name,
                modifier = Modifier.fillMaxWidth().weight(1f),
                contentScale = ContentScale.Crop,
            )
        } else {
            val accentGradient = Brush.verticalGradient(
                listOf(MaterialTheme.colorScheme.secondary, MaterialTheme.colorScheme.tertiary),
            )
            Box(Modifier.fillMaxWidth().weight(1f).background(accentGradient))
        }
        Column(
            Modifier
                .fillMaxWidth()
                .padding(24.dp)
                .glassCard(20.dp)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(category.name, style = MaterialTheme.typography.displaySmall)
            if (category.description.isNotBlank()) {
                Spacer(Modifier.height(8.dp))
                HtmlText(
                    html = category.description,
                    style = MaterialTheme.typography.titleMedium.copy(
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    ),
                )
            }
        }
    }
}
