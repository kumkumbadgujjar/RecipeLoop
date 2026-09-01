package com.example.recipeloop.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class RecipesResponse(
    val limit: Int,
    val recipes: List<RecipeDTO>,
    val skip: Int,
    val total: Int
)