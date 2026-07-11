package com.distributor.presenter.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.distributor.presenter.data.Brand
import com.distributor.presenter.data.ProductApi
import com.distributor.presenter.ui.theme.PresenterMuted
import com.distributor.presenter.ui.theme.PresenterSurfaceDeep
import com.distributor.presenter.ui.theme.presenterCard
import com.distributor.presenter.ui.theme.presenterPill
import java.util.Locale

@Composable
fun CoverPage(brand: Brand?) {
    Box(
        Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier.widthIn(max = 560.dp).presenterCard(24.dp).padding(40.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            val logoUrl = brand?.logoUrl
            if (!logoUrl.isNullOrBlank()) {
                AsyncImage(
                    model = ProductApi.resolveUrl(relativeUrl = logoUrl),
                    contentDescription = brand.name,
                    modifier = Modifier.size(140.dp),
                )
                Spacer(Modifier.height(24.dp))
            }
            Text(
                text = (brand?.name?.takeIf { it.isNotBlank() } ?: "Каталог товарів")
                    .uppercase(Locale.getDefault()),
                color = Color.White,
                style = MaterialTheme.typography.displaySmall,
                textAlign = TextAlign.Center,
            )
            val tagline = brand?.tagline
            if (!tagline.isNullOrBlank()) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = tagline,
                    color = PresenterMuted,
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                )
            }
            Spacer(Modifier.height(32.dp))
            Text(
                text = "ГОРТАЙТЕ, ЩОБ ПОДИВИТИСЯ ТОВАРИ →",
                color = PresenterSurfaceDeep,
                style = MaterialTheme.typography.labelMedium,
                modifier = Modifier.presenterPill().padding(horizontal = 14.dp, vertical = 8.dp),
            )
        }
    }
}
