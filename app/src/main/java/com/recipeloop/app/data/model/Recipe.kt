package com.recipeloop.app.data.model

import com.google.gson.annotations.SerializedName

data class Recipe(
    val id: Int,
    val name: String,
    val ingredients: List<String> = emptyList(),
    val instructions: List<String> = emptyList(),
    @SerializedName("prepTimeMinutes") val prepTimeMinutes: Int = 0,
    @SerializedName("cookTimeMinutes") val cookTimeMinutes: Int = 0,
    val servings: Int = 1,
    val difficulty: String = "Easy",
    val cuisine: String = "All",
    @SerializedName("caloriesPerServing") val caloriesPerServing: Int = 0,
    val tags: List<String> = emptyList(),
    val userId: Int = 0,
    val image: String = "",
    val rating: Double = 4.5,
    val reviewCount: Int = 0,
    val mealType: List<String> = emptyList(),
    var isFavorite: Boolean = false
) {
    val totalTimeMinutes: Int
        get() = prepTimeMinutes + cookTimeMinutes
}

data class RecipesResponse(
    val recipes: List<Recipe> = emptyList(),
    val total: Int = 0,
    val skip: Int = 0,
    val limit: Int = 0
)

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val role: String, // "user" or "model"
    val content: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isVoiceInput: Boolean = false
)
