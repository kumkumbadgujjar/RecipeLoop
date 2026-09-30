package com.recipeloop.app.data.local

import android.content.Context
import com.google.gson.Gson
import com.recipeloop.app.data.model.Recipe
import com.recipeloop.app.data.model.RecipesResponse
import java.io.InputStreamReader

class RecipeJsonDataSource(private val context: Context) {
    private val gson = Gson()
    private var cachedRecipes: List<Recipe>? = null

    fun getRecipes(): List<Recipe> {
        cachedRecipes?.let { return it }

        return try {
            context.assets.open("recipes.json").use { inputStream ->
                InputStreamReader(inputStream).use { reader ->
                    val response = gson.fromJson(reader, RecipesResponse::class.java)
                    val list = response.recipes
                    cachedRecipes = list
                    list
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }
}
