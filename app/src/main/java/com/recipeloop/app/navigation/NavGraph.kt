package com.recipeloop.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.recipeloop.app.ui.screens.ai.AiChatScreen
import com.recipeloop.app.ui.screens.favorites.FavoritesScreen
import com.recipeloop.app.ui.screens.home.HomeScreen
import com.recipeloop.app.ui.screens.recipe.RecipeDetailScreen
import com.recipeloop.app.viewmodel.AiChatViewModel
import com.recipeloop.app.viewmodel.RecipeViewModel

@Composable
fun NavGraph(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    recipeViewModel: RecipeViewModel = viewModel(),
    aiChatViewModel: AiChatViewModel = viewModel()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route,
        modifier = modifier
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                viewModel = recipeViewModel,
                onRecipeClick = { recipeId ->
                    navController.navigate(Screen.RecipeDetail.createRoute(recipeId))
                },
                onFavoritesClick = {
                    navController.navigate(Screen.Favorites.route)
                },
                onAiClick = {
                    navController.navigate(Screen.AiChat.route)
                }
            )
        }

        composable(
            route = Screen.RecipeDetail.route,
            arguments = listOf(navArgument("recipeId") { type = NavType.IntType })
        ) { backStackEntry ->
            val recipeId = backStackEntry.arguments?.getInt("recipeId") ?: 0
            val recipe = recipeViewModel.getRecipeById(recipeId)

            RecipeDetailScreen(
                recipe = recipe,
                onBackClick = { navController.popBackStack() },
                onFavoriteToggle = { recipeViewModel.toggleFavorite(recipeId) }
            )
        }

        composable(Screen.Favorites.route) {
            FavoritesScreen(
                viewModel = recipeViewModel,
                onRecipeClick = { recipeId ->
                    navController.navigate(Screen.RecipeDetail.createRoute(recipeId))
                },
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.AiChat.route) {
            AiChatScreen(
                viewModel = aiChatViewModel,
                onBackClick = { navController.popBackStack() }
            )
        }
    }
}
