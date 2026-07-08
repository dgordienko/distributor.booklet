package com.distributor.presenter.data

// Товар может входить сразу в несколько категорий (например, в свою обычную
// категорию и в кросс-категорийную "Акционное предложение"). order — позиция
// страницы товара внутри конкретной категории, своя для каждой связи.
data class ProductCategoryRef(
    val categoryId: Int,
    val order: Int,
)

data class Product(
    val id: Int,
    val categories: List<ProductCategoryRef>,
    val name: String,
    val manufacturer: String,
    val trademark: String,
    val productType: String,
    val description: String,
    val shelfLife: String,
    val storageTemperature: String,
    val composition: String,
    val basePrice: Double,
    val currency: String,
    val isActive: Boolean,
    val photos: List<Photo>,
) {
    val primaryPhoto: Photo?
        get() = photos.firstOrNull { it.isPrimary } ?: photos.firstOrNull()

    fun orderIn(categoryId: Int): Int =
        categories.firstOrNull { it.categoryId == categoryId }?.order ?: 0
}

data class Photo(
    val id: Int,
    val filename: String,
    val url: String,
    val isPrimary: Boolean,
)

// Раздел буклета: собственная страница-разделитель перед товарами категории.
data class Category(
    val id: Int,
    val name: String,
    val description: String,
    val imageUrl: String,
    val order: Int,
)

data class Brand(
    val id: Int,
    val name: String,
    val tagline: String,
    val logoUrl: String,
)
