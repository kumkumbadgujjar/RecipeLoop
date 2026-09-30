package com.recipeloop.app.data.local

import android.content.Context
import android.content.SharedPreferences

class FavoritesDataStore(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("recipeloop_favorites", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_FAVORITES = "favorite_recipe_ids"
    }

    fun getFavoriteIds(): Set<Int> {
        val stringSet = prefs.getStringSet(KEY_FAVORITES, emptySet()) ?: emptySet()
        return stringSet.mapNotNull { it.toIntOrNull() }.toSet()
    }

    fun toggleFavorite(recipeId: Int): Boolean {
        val currentFavorites = getFavoriteIds().toMutableSet()
        val isNowFavorite = if (currentFavorites.contains(recipeId)) {
            currentFavorites.remove(recipeId)
            false
        } else {
            currentFavorites.add(recipeId)
            true
        }

        prefs.edit()
            .putStringSet(KEY_FAVORITES, currentFavorites.map { it.toString() }.toSet())
            .apply()

        return isNowFavorite
    }

    fun isFavorite(recipeId: Int): Boolean {
        return getFavoriteIds().contains(recipeId)
    }
}
