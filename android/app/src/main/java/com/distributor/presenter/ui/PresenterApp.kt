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
// пролистываются как книга) и "product/{id}" — отдельная страница с полным
// описанием, куда можно провалиться тапом по товару.
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
            val product = currentProducts.firstOrNull { it.id == id }
            if (product != null) {
                ProductDetailScreen(
                    product = product,
                    onBack = { navController.popBackStack() },
                )
            }
        }
    }
}
