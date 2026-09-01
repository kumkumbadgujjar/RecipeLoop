package com.example.recipeloop.presentation.navigation

import kotlinx.serialization.Serializable

@Serializable
object HomeRoute

@Serializable
data class RecipeDetailRoute(val recipeId: Int)