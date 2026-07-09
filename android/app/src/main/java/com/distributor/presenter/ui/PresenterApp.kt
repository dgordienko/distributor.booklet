package com.distributor.presenter.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.distributor.presenter.data.Brand
import com.distributor.presenter.data.Category
import com.distributor.presenter.data.Product
import com.distributor.presenter.data.ProductApi

// Навигация буклета: "book" (обложка + разделы категорий + сетки товаров,
// пролистываются как книга) и "product/{id}" — полноэкранная карточка
// товара (та же раскладка, что и раньше стояла карусель), куда можно
// провалиться тапом по плитке в сетке, а дальше пролистать соседние товары.
@Composable
fun PresenterApp(api: ProductApi = remember { ProductApi.create() }) {
    var brand by remember { mutableStateOf<Brand?>(null) }
    var categories by remember { mutableStateOf<List<Category>?>(null) }
    var products by remember { mutableStateOf<List<Product>?>(null) }

    LaunchedEffect(Unit) {
        brand = runCatching { api.getBrand() }.getOrNull()
        categories = runCatching { api.listCategories() }.getOrDefault(emptyList())
        products = runCatching { api.listProducts() }
            .getOrDefault(emptyList())
            .filter { it.isActive }
    }

    val currentCategories = categories
    val currentProducts = products
    if (currentCategories == null || currentProducts == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    val orderedProducts = remember(currentCategories, currentProducts) {
        orderProducts(currentCategories, currentProducts)
    }

    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "book") {
        composable("book") {
            BookScreen(
                brand = brand,
                categories = currentCategories,
                products = currentProducts,
                onProductClick = { id -> navController.navigate("product/$id") },
            )
        }
        composable(
            route = "product/{id}",
            arguments = listOf(navArgument("id") { type = NavType.IntType }),
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getInt("id")
            ProductCarouselScreen(
                products = orderedProducts,
                initialProductId = id,
                onBack = { navController.popBackStack() },
            )
        }
    }
}

// Товар может входить в несколько категорий — для карточки товара берём
// каждый товар один раз (по первому появлению по порядку категорий), чтобы
// пролистывание соседних товаров не дублировало один и тот же товар подряд.
private fun orderProducts(categories: List<Category>, products: List<Product>): List<Product> {
    val seen = mutableSetOf<Int>()
    val ordered = mutableListOf<Product>()
    categories.sortedBy { it.order }.forEach { category ->
        products
            .filter { product -> product.categories.any { it.categoryId == category.id } }
            .sortedBy { it.orderIn(category.id) }
            .forEach { product -> if (seen.add(product.id)) ordered += product }
    }
    products.filter { it.categories.isEmpty() }.forEach { product -> if (seen.add(product.id)) ordered += product }
    return ordered
}
