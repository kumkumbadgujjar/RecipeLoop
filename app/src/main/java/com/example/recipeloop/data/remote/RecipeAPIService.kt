package com.example.recipeloop.data.remote

import com.example.recipeloop.data.remote.dto.AddRecipeRequest
import com.example.recipeloop.data.remote.dto.RecipeDTO
import com.example.recipeloop.data.remote.dto.RecipesResponse
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType

class RecipeAPIService(private val client: HttpClient) {

    suspend fun getAllRecipes(): RecipesResponse{
        return client.get(urlString = "${KtorClient.BASE_URL}recipes").body()
    }
    suspend fun getRecipebyID(id: Int): RecipeDTO{
        return client.get(urlString = "${KtorClient.BASE_URL}recipes/$id").body()
    }
    suspend fun addRecipe(request: AddRecipeRequest){
        client.post("${KtorClient.BASE_URL}recipes/add"){
            contentType(ContentType.Application.Json)
            setBody(request)
        }
    }


}