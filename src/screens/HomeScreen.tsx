import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { RecipeDTO } from '../types/recipe';
import { recipeRepository } from '../services/recipeApi';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';
import { HomeHeader } from '../components/home/HomeHeader';
import { CategorySection } from '../components/home/CategorySection';
import { SectionHeader } from '../components/home/SectionHeader';
import { RecipeCard } from '../components/home/RecipeCard';

interface HomeScreenProps {
  onRecipeClick: (id: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onRecipeClick }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [allRecipes, setAllRecipes] = useState<RecipeDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await recipeRepository.getAllRecipes();
      setAllRecipes(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const categories = useMemo(() => {
    const cuisines = Array.from(
      new Set(allRecipes.map((r) => r.cuisine).filter(Boolean))
    ).sort();
    return ['All', ...cuisines];
  }, [allRecipes]);

  const displayedRecipes = useMemo(() => {
    if (selectedCategory === 'All') {
      return allRecipes;
    }
    return allRecipes.filter((r) => r.cuisine === selectedCategory);
  }, [allRecipes, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FF5722]/[0.02] flex flex-col">
      {/* TopAppBar */}
      <header className="sticky top-0 z-20 flex items-center h-14 px-4 bg-white border-b border-neutral-200/80 shadow-xs">
        <h1 className="text-xl font-bold text-neutral-800 tracking-tight">
          Recipes
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4">
        {isLoading ? (
          <LoadingIndicator />
        ) : errorMessage ? (
          <ErrorMessage
            errorMessage={errorMessage}
            onRetry={fetchRecipes}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Header Banner */}
            <HomeHeader />

            {/* Category Filter Section */}
            {categories.length > 1 && (
              <CategorySection
                categories={categories}
                selected={selectedCategory}
                onSelected={setSelectedCategory}
              />
            )}

            {/* Section Header */}
            <SectionHeader
              title={
                selectedCategory === 'All'
                  ? 'All Recipes'
                  : selectedCategory
              }
              icon={Menu}
            />

            {/* Recipes Grid */}
            {displayedRecipes.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-center">
                <span className="text-xl font-bold text-[#FF5722]">
                  No recipes found
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {displayedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => onRecipeClick(recipe.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
