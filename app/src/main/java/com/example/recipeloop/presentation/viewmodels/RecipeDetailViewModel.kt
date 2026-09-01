package com.example.recipeloop.presentation.viewmodels

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import com.example.recipeloop.data.remote.KtorClient
import com.example.recipeloop.data.remote.RecipeAPIService
import com.example.recipeloop.data.remote.repository.RecipeRespositoryImpl
import com.example.recipeloop.domain.repository.RecipeRespository
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.recipeloop.data.remote.dto.RecipeDTO
import kotlinx.coroutines.launch

class RecipeDetailViewModel : ViewModel(){

    private val repository: RecipeRespository=
        RecipeRespositoryImpl(apiService = RecipeAPIService(KtorClient.client))

    var isLoading by mutableStateOf(false)
        private set
    var errorMessage by mutableStateOf<String?>(null)
        private set
    var recipe by mutableStateOf<RecipeDTO?>(null)
        private set
    fun fetchRecipeDetail(id: Int){
        isLoading=true
        errorMessage=null

        try {
            viewModelScope.launch {
                recipe=repository.getRecipeById(id)
            }

        }catch (e: Exception){
            errorMessage=e.message ?: "An unexpected error occured!"
        }finally {
            isLoading=false
        }


    }
}