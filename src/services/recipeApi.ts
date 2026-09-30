import { RecipeDTO, RecipesResponse, AddRecipeRequest } from '../types/recipe';

const BASE_URL = 'https://dummyjson.com/';

export class RecipeAPIService {
  async getAllRecipes(): Promise<RecipesResponse> {
    const res = await fetch(`${BASE_URL}recipes?limit=50`);
    if (!res.ok) {
      throw new Error(`Failed to fetch recipes: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async getRecipeById(id: number): Promise<RecipeDTO> {
    const res = await fetch(`${BASE_URL}recipes/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch recipe #${id}: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  async addRecipe(request: AddRecipeRequest): Promise<RecipeDTO> {
    const res = await fetch(`${BASE_URL}recipes/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      throw new Error(`Failed to add recipe: ${res.status}`);
    }
    return res.json();
  }
}

export interface RecipeRepository {
  getAllRecipes(): Promise<RecipeDTO[]>;
  getRecipeById(id: number): Promise<RecipeDTO>;
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
}

export const recipeRepository = new RecipeRepositoryImpl();
