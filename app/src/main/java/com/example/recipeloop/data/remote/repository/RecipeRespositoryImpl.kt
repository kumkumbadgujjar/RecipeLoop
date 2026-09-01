package com.example.recipeloop.data.remote.repository

import com.example.recipeloop.data.remote.RecipeAPIService
import com.example.recipeloop.data.remote.dto.RecipeDTO
import com.example.recipeloop.domain.repository.RecipeRespository

class RecipeRespositoryImpl(private val apiService: RecipeAPIService): RecipeRespository{
    override suspend fun getAllRecipes(): List<RecipeDTO> {
        return apiService.getAllRecipes().recipes
    }

    override suspend fun getRecipeById(id: Int): RecipeDTO {
        return apiService.getRecipebyID(id)
    }
}