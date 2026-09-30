import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  Globe,
  Star,
  Zap,
  Timer,
  Clock,
  Flame,
  Egg,
  Utensils,
  Info,
} from 'lucide-react';
import { RecipeDTO } from '../types/recipe';
import { recipeRepository } from '../services/recipeApi';
import { MyTopBar } from '../components/MyTopBar';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';
import { DetailSection } from '../components/recipe_detail/DetailSection';
import { InfoChip } from '../components/recipe_detail/InfoChip';
import { StatItem } from '../components/recipe_detail/StatItem';

interface RecipeDetailScreenProps {
  recipeId: number;
  onBack: () => void;
}

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipeId,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<RecipeDTO | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  const fetchRecipeDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await recipeRepository.getRecipeById(recipeId);
      setRecipe(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred!'
      );
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchRecipeDetail();
  }, [fetchRecipeDetail]);

  return (
    <div className="min-h-screen bg-[#FF5722]/[0.08] flex flex-col">
      <MyTopBar title="Recipe Detail" onBackClick={onBack} />

      <main className="flex-1 w-full max-w-2xl mx-auto p-4">
        {isLoading ? (
          <LoadingIndicator />
        ) : errorMessage ? (
          <ErrorMessage
            errorMessage={errorMessage}
            onRetry={fetchRecipeDetail}
          />
        ) : recipe ? (
          <div className="flex flex-col gap-4 pb-8">
            {/* Hero Image */}
            <div className="w-full h-52 sm:h-64 rounded-3xl overflow-hidden bg-neutral-200 border border-neutral-200 shadow-xs relative">
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center text-5xl bg-neutral-100">
                  🥗
                </div>
              ) : (
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            {/* Recipe Details */}
            <DetailSection title="Recipe Details" icon={Eye}>
              <h2 className="text-2xl font-bold text-neutral-800 mb-3">
                {recipe.name}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <InfoChip label={recipe.cuisine} icon={Globe} />
                <InfoChip label={recipe.difficulty} icon={Star} />
                {recipe.mealType && recipe.mealType.length > 0 && (
                  <InfoChip label={recipe.mealType[0]} icon={Zap} />
                )}
              </div>
            </DetailSection>

            {/* At a Glance */}
            <DetailSection title="At a Glance" icon={Timer}>
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex-1">
                  <StatItem
                    icon={Clock}
                    label="Prep"
                    value={`${recipe.prepTimeMinutes}m`}
                  />
                </div>
                <div className="w-px h-9 bg-neutral-300" />
                <div className="flex-1">
                  <StatItem
                    icon={Flame}
                    label="Cook"
                    value={`${recipe.cookTimeMinutes}m`}
                  />
                </div>
                <div className="w-px h-9 bg-neutral-300" />
                <div className="flex-1">
                  <StatItem
                    icon={Egg}
                    label="Serves"
                    value={`${recipe.servings}`}
                  />
                </div>
                <div className="w-px h-9 bg-neutral-300" />
                <div className="flex-1">
                  <StatItem
                    icon={Flame}
                    label="Cal"
                    value={`${recipe.caloriesPerServing}`}
                  />
                </div>
              </div>
            </DetailSection>

            {/* Ingredients */}
            <DetailSection title="Ingredients" icon={Utensils}>
              <div className="flex flex-col gap-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-start text-neutral-800 text-sm leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] mt-2 mr-3 shrink-0" />
                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
            </DetailSection>

            {/* Instructions */}
            <DetailSection title="Instructions" icon={Info}>
              <div className="flex flex-col gap-3">
                {recipe.instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-start text-neutral-800 text-sm leading-relaxed"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#FF5722] text-white font-bold text-xs flex items-center justify-center shrink-0 mr-3 mt-0.5 shadow-2xs">
                      {index + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{instruction}</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          </div>
        ) : null}
      </main>
    </div>
  );
};
