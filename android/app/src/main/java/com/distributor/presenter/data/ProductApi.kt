package com.distributor.presenter.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET

interface ProductApi {
    @GET("api/products")
    suspend fun listProducts(): List<Product>

    @GET("api/brand")
    suspend fun getBrand(): Brand

    @GET("api/categories")
    suspend fun listCategories(): List<Category>

    companion object {
        // 10.0.2.2 маршрутизируется на localhost хост-машины из Android-эмулятора.
        // На реальном планшете замените на адрес сервера в локальной сети.
        const val BASE_URL = "http://10.0.2.2:4000/"

        fun create(baseUrl: String = BASE_URL): ProductApi =
            Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ProductApi::class.java)

        // Фото и логотип бренда хранятся как относительные пути ("/uploads/...").
        fun resolveUrl(baseUrl: String = BASE_URL, relativeUrl: String): String =
            baseUrl.trimEnd('/') + relativeUrl

        fun photoUrl(baseUrl: String = BASE_URL, photo: Photo): String =
            resolveUrl(baseUrl, photo.url)
    }
}
