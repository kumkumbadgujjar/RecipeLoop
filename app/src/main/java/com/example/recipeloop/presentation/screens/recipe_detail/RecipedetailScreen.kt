package com.example.recipeloop.presentation.screens.recipe_detail

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.recipeloop.presentation.components.ErrorMessage
import com.example.recipeloop.presentation.components.LoadingIndicator
import com.example.recipeloop.presentation.components.MyTopBar
import com.example.recipeloop.presentation.viewmodels.RecipeDetailViewModel
import com.example.recipeloop.ui.theme.MyOrange

@Composable
fun RecipedetailScreen(
    recipeId: Int,
    onBack: () -> Unit,
    viewModel: RecipeDetailViewModel = viewModel()
) {

    LaunchedEffect(recipeId) {
        viewModel.fetchRecipeDetail(recipeId)
    }

    Scaffold(
        topBar = {
            MyTopBar(
                title = "Recipe Detail",
                onBackClick = onBack,
                icon = Icons.AutoMirrored.Filled.ArrowBack
            )
        }
    ) { innerpadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerpadding)
                .background(color = MyOrange.copy(0.2f))
        ) {
            when {
                viewModel.isLoading -> LoadingIndicator(strokeWidth = 1.dp)

                viewModel.errorMessage != null -> ErrorMessage(
                    errorMessage = viewModel.errorMessage,
                    onRetry = { viewModel.fetchRecipeDetail(recipeId) }
                )

                viewModel.recipe != null -> {
                    RecipeDetailContent(
                        details = viewModel.recipe!!
                    )
                }


            }
        }
    }
}