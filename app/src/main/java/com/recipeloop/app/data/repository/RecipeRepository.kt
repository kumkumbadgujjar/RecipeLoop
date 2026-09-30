package com.recipeloop.app.data.repository

import com.recipeloop.app.data.local.FavoritesDataStore
import com.recipeloop.app.data.local.RecipeJsonDataSource
import com.recipeloop.app.data.model.Recipe
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class RecipeRepository(
    private val jsonDataSource: RecipeJsonDataSource,
    private val favoritesDataStore: FavoritesDataStore
) {
    suspend fun getAllRecipes(): List<Recipe> = withContext(Dispatchers.IO) {
        val favoriteIds = favoritesDataStore.getFavoriteIds()
        val recipes = jsonDataSource.getRecipes()
        recipes.map { recipe ->
            recipe.copy(isFavorite = favoriteIds.contains(recipe.id))
        }
    }

    suspend fun getRecipeById(id: Int): Recipe? = withContext(Dispatchers.IO) {
        val recipes = getAllRecipes()
        recipes.find { it.id == id }
    }

    suspend fun getFavoriteRecipes(): List<Recipe> = withContext(Dispatchers.IO) {
        val favoriteIds = favoritesDataStore.getFavoriteIds()
        val recipes = jsonDataSource.getRecipes()
        recipes.filter { favoriteIds.contains(it.id) }
            .map { it.copy(isFavorite = true) }
    }

    suspend fun searchAndFilterRecipes(
        query: String,
        selectedCategory: String
    ): List<Recipe> = withContext(Dispatchers.IO) {
        var list = getAllRecipes()

        if (selectedCategory.isNotBlank() && !selectedCategory.equals("All", ignoreCase = true)) {
            list = list.filter { it.cuisine.equals(selectedCategory, ignoreCase = true) }
        }

        val q = query.trim().lowercase()
        if (q.isNotEmpty()) {
            list = list.filter { recipe ->
                recipe.name.lowercase().contains(q) ||
                    recipe.cuisine.lowercase().contains(q) ||
                    recipe.difficulty.lowercase().contains(q) ||
                    recipe.tags.any { it.lowercase().contains(q) } ||
                    recipe.ingredients.any { it.lowercase().contains(q) }
            }
        }

        list
    }

    suspend fun toggleFavorite(recipeId: Int): Boolean = withContext(Dispatchers.IO) {
        favoritesDataStore.toggleFavorite(recipeId)
    }

    suspend fun getCategories(): List<String> = withContext(Dispatchers.IO) {
        val recipes = jsonDataSource.getRecipes()
        val distinctCuisines = recipes.map { it.cuisine }
            .filter { it.isNotBlank() }
            .distinct()
            .sorted()
        listOf("All") + distinctCuisines
    }
}
