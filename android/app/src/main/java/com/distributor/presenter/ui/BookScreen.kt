package com.distributor.presenter.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.PagerState
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import com.distributor.presenter.data.Brand
import com.distributor.presenter.data.Category
import com.distributor.presenter.data.Product
import kotlin.math.absoluteValue

private const val PRODUCTS_PER_PAGE = 6

private sealed class BookPageContent {
    data object Cover : BookPageContent()
    data class CategoryDivider(val category: Category) : BookPageContent()
    data class ProductGrid(val products: List<Product>) : BookPageContent()
}

// Товар может входить сразу в несколько категорий (например, в "Акционное
// предложение" поперёк остальных разделов), поэтому один товар может попасть
// на страницы нескольких разделов буклета — по разу на каждую свою категорию.
private fun buildPages(
    categories: List<Category>,
    products: List<Product>,
): List<BookPageContent> {
    val pages = mutableListOf<BookPageContent>(BookPageContent.Cover)

    categories.sortedBy { it.order }.forEach { category ->
        pages += BookPageContent.CategoryDivider(category)
        products
            .filter { product -> product.categories.any { it.categoryId == category.id } }
            .sortedBy { it.orderIn(category.id) }
            .chunked(PRODUCTS_PER_PAGE)
            .forEach { pages += BookPageContent.ProductGrid(it) }
    }

    // Товары без категории показываем в конце, без страницы-разделителя.
    products.filter { it.categories.isEmpty() }
        .chunked(PRODUCTS_PER_PAGE)
        .forEach { pages += BookPageContent.ProductGrid(it) }

    return pages
}

@Composable
fun BookScreen(
    brand: Brand?,
    categories: List<Category>,
    products: List<Product>,
    onProductClick: (Int) -> Unit,
) {
    val pages = remember(categories, products) { buildPages(categories, products) }
    val pagerState = rememberPagerState(pageCount = { pages.size })

    HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
        BookPage(pagerState = pagerState, page = page) {
            when (val content = pages[page]) {
                is BookPageContent.Cover -> CoverPage(brand = brand)
                is BookPageContent.CategoryDivider ->
                    CategoryDividerPage(category = content.category)
                is BookPageContent.ProductGrid ->
                    CatalogGridPage(products = content.products, onProductClick = onProductClick)
            }
        }
    }
}

// Лёгкий 3D-эффект переворота страницы буклета при свайпе.
@Composable
private fun BookPage(pagerState: PagerState, page: Int, content: @Composable () -> Unit) {
    Box(
        Modifier
            .fillMaxSize()
            .graphicsLayer {
                val pageOffset =
                    (pagerState.currentPage - page) + pagerState.currentPageOffsetFraction
                val absOffset = pageOffset.absoluteValue.coerceIn(0f, 1f)
                rotationY = -pageOffset * 25f
                cameraDistance = 16f * density
                alpha = 1f - absOffset * 0.25f
                transformOrigin = TransformOrigin(if (pageOffset > 0) 0f else 1f, 0.5f)
            },
    ) {
        content()
    }
}
