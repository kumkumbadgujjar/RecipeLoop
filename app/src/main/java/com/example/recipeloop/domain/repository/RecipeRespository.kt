package com.example.recipeloop.domain.repository

import com.example.recipeloop.data.remote.dto.RecipeDTO

interface RecipeRespository {

    suspend fun getAllRecipes(): List<RecipeDTO>

    suspend fun getRecipeById(id: Int): RecipeDTO
}