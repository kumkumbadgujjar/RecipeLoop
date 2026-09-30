package com.recipeloop.app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.recipeloop.app.data.local.FavoritesDataStore
import com.recipeloop.app.data.local.RecipeJsonDataSource
import com.recipeloop.app.data.model.Recipe
import com.recipeloop.app.data.repository.RecipeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class RecipeViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = RecipeRepository(
        jsonDataSource = RecipeJsonDataSource(application),
        favoritesDataStore = FavoritesDataStore(application)
    )

    private val _allRecipes = MutableStateFlow<List<Recipe>>(emptyList())
    private val _categories = MutableStateFlow<List<String>>(listOf("All"))
    val categories: StateFlow<List<String>> = _categories.asStateFlow()

    private val _selectedCategory = MutableStateFlow("All")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    // Filtered recipes combining allRecipes, selectedCategory, and searchQuery
    val displayedRecipes: StateFlow<List<Recipe>> = combine(
        _allRecipes,
        _selectedCategory,
        _searchQuery
    ) { recipes, category, query ->
        var list = recipes

        if (category != "All") {
            list = list.filter { it.cuisine.equals(category, ignoreCase = true) }
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
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favoriteRecipes: StateFlow<List<Recipe>> = _allRecipes.combine(_selectedCategory) { recipes, _ ->
        recipes.filter { it.isFavorite }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val recipes = repository.getAllRecipes()
                _allRecipes.value = recipes
                _categories.value = repository.getCategories()
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun onSearchQueryChange(newQuery: String) {
        _searchQuery.value = newQuery
    }

    fun clearSearch() {
        _searchQuery.value = ""
    }

    fun onCategorySelect(category: String) {
        _selectedCategory.value = category
    }

    fun toggleFavorite(recipeId: Int) {
        viewModelScope.launch {
            repository.toggleFavorite(recipeId)
            _allRecipes.value = _allRecipes.value.map { recipe ->
                if (recipe.id == recipeId) {
                    recipe.copy(isFavorite = !recipe.isFavorite)
                } else {
                    recipe
                }
            }
        }
    }

    fun getRecipeById(recipeId: Int): Recipe? {
        return _allRecipes.value.find { it.id == recipeId }
    }
}
