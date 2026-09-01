package com.example.recipeloop.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.example.recipeloop.presentation.screens.home.HomeScreen
import com.example.recipeloop.presentation.screens.recipe_detail.RecipedetailScreen

@Composable
fun RecipeNavHost(){

    val navController = rememberNavController()

    NavHost(
        navController= navController,
        startDestination = HomeRoute
    ){
        composable<HomeRoute>{
            HomeScreen(
                onRecipeClick = { id ->
                    navController.navigate(RecipeDetailRoute(id))}
            )
        }

        composable<RecipeDetailRoute> { backStackEntry ->

            val detailRoute = backStackEntry.toRoute<RecipeDetailRoute>()

            RecipedetailScreen(
                recipeId = detailRoute.recipeId,
                onBack = {navController.popBackStack()}
            )
        }

    }



}