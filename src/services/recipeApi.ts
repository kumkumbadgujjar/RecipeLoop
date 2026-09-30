import { RecipeDTO, RecipesResponse, AddRecipeRequest } from '../types/recipe';
import localRecipesData from '../data/recipes.json';

const BASE_URL = '/api/';

export class RecipeAPIService {
  private fallbackData: RecipesResponse = localRecipesData as unknown as RecipesResponse;

  async getAllRecipes(): Promise<RecipesResponse> {
    try {
      const res = await fetch(`${BASE_URL}recipes`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // In development or offline, fallback seamlessly to bundled 300+ dataset
    }
    return this.fallbackData;
  }

  async getRecipeById(id: number): Promise<RecipeDTO> {
    try {
      const res = await fetch(`${BASE_URL}recipes/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const found = this.fallbackData.recipes.find((r) => r.id === id);
    if (found) {
      return found;
    }
    throw new Error(`Recipe #${id} not found`);
  }

  async searchRecipes(query: string): Promise<RecipesResponse> {
    try {
      const res = await fetch(`${BASE_URL}recipes/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const q = query.toLowerCase().trim();
    const filtered = this.fallbackData.recipes.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.difficulty.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.toLowerCase().includes(q)) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    return {
      recipes: filtered,
      total: filtered.length,
      skip: 0,
      limit: filtered.length,
    };
  }

  async addRecipe(request: AddRecipeRequest): Promise<RecipeDTO> {
    try {
      const res = await fetch(`${BASE_URL}recipes/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const newRecipe: RecipeDTO = {
      id: this.fallbackData.recipes.length + 1,
      ...request,
      rating: 4.8,
      reviewCount: 1,
      userId: 1,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    };
    this.fallbackData.recipes.push(newRecipe);
    return newRecipe;
  }
}

export interface RecipeRepository {
  getAllRecipes(): Promise<RecipeDTO[]>;
  getRecipeById(id: number): Promise<RecipeDTO>;
  searchRecipes(query: string): Promise<RecipeDTO[]>;
}

export class RecipeRepositoryImpl implements RecipeRepository {
  constructor(private apiService: RecipeAPIService = new RecipeAPIService()) {}

  async getAllRecipes(): Promise<RecipeDTO[]> {
    const response = await this.apiService.getAllRecipes();
    return response.recipes;
  }

  async getRecipeById(id: number): Promise<RecipeDTO> {
    return this.apiService.getRecipeById(id);
  }

  async searchRecipes(query: string): Promise<RecipeDTO[]> {
    const response = await this.apiService.searchRecipes(query);
    return response.recipes;
  }
}

export const recipeRepository = new RecipeRepositoryImpl();
