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
import { SearchBar } from '../components/home/SearchBar';
import { FloatingAiButton } from '../components/home/FloatingAiButton';

interface HomeScreenProps {
  onRecipeClick: (id: number) => void;
  onAiClick: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onRecipeClick,
  onAiClick,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [allRecipes, setAllRecipes] = useState<RecipeDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Search through the same recipe data/API already used by the app
  const displayedRecipes = useMemo(() => {
    let recipes = allRecipes;

    // Filter by category
    if (selectedCategory !== 'All') {
      recipes = recipes.filter((r) => r.cuisine === selectedCategory);
    }

    // Filter by search query if present
    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed) {
      recipes = recipes.filter((r) => {
        const matchesName = r.name.toLowerCase().includes(trimmed);
        const matchesCuisine = r.cuisine.toLowerCase().includes(trimmed);
        const matchesIngredients = r.ingredients.some((ing) =>
          ing.toLowerCase().includes(trimmed)
        );
        const matchesTags = r.tags.some((tag) =>
          tag.toLowerCase().includes(trimmed)
        );
        const matchesDifficulty = r.difficulty.toLowerCase().includes(trimmed);
        return (
          matchesName ||
          matchesCuisine ||
          matchesIngredients ||
          matchesTags ||
          matchesDifficulty
        );
      });
    }

    return recipes;
  }, [allRecipes, selectedCategory, searchQuery]);

  return (
    <div className="relative min-h-screen bg-[#FF5722]/[0.02] flex flex-col">
      {/* TopAppBar */}
      <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 bg-white border-b border-neutral-200/80 shadow-xs">
        <h1 className="text-xl font-bold text-neutral-800 tracking-tight">
          Recipes
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 pb-24">
        {isLoading ? (
          <LoadingIndicator />
        ) : errorMessage ? (
          <ErrorMessage errorMessage={errorMessage} onRetry={fetchRecipes} />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Search Bar at the top of the main RecipeLoop screen */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />

            {/* Header Banner - visible when not searching */}
            {!searchQuery && <HomeHeader />}

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
                searchQuery
                  ? `Search results (${displayedRecipes.length})`
                  : selectedCategory === 'All'
                  ? 'All Recipes'
                  : selectedCategory
              }
              icon={Menu}
            />

            {/* Recipes Grid */}
            {displayedRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-xl font-bold text-[#FF5722] mb-2">
                  No recipes found
                </span>
                {searchQuery && (
                  <p className="text-sm text-neutral-500 max-w-xs">
                    No recipes matched &ldquo;{searchQuery}&rdquo;. Try another
                    ingredient or clear your search.
                  </p>
                )}
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

      {/* Floating AI Button at the bottom-right of the main RecipeLoop screen */}
      <FloatingAiButton onClick={onAiClick} />
    </div>
  );
};
