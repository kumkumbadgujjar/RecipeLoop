package com.recipeloop.app.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object RecipeDetail : Screen("recipe/{recipeId}") {
        fun createRoute(recipeId: Int): String = "recipe/$recipeId"
    }
    object Favorites : Screen("favorites")
    object AiChat : Screen("ai_chat")
}
