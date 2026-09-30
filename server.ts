import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0';

app.use(express.json());

interface ChatHistoryItem {
  role: 'user' | 'model';
  content: string;
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Load RecipeLoop Realistic Dataset (300+ recipes)
interface RecipeDTO {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  caloriesPerServing: number;
  tags: string[];
  userId: number;
  image: string;
  rating: number;
  reviewCount: number;
  mealType: string[];
}

let recipesList: RecipeDTO[] = [];
try {
  const recipesFilePath = path.resolve(__dirname, 'src/data/recipes.json');
  const recipesFileContent = fs.readFileSync(recipesFilePath, 'utf-8');
  const parsed = JSON.parse(recipesFileContent);
  recipesList = parsed.recipes || [];
  console.log(`Loaded ${recipesList.length} recipes in server memory.`);
} catch (err) {
  console.error('Failed to load recipes.json on server:', err);
}

// GET /api/recipes
app.get('/api/recipes', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : recipesList.length;
  const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
  const paginated = recipesList.slice(skip, skip + limit);
  res.json({
    recipes: paginated,
    total: recipesList.length,
    skip,
    limit,
  });
});

// GET /api/recipes/search?q=...
app.get('/api/recipes/search', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  if (!query) {
    res.json({
      recipes: recipesList,
      total: recipesList.length,
      skip: 0,
      limit: recipesList.length,
    });
    return;
  }

  const filtered = recipesList.filter((r) => {
    return (
      r.name.toLowerCase().includes(query) ||
      r.cuisine.toLowerCase().includes(query) ||
      r.difficulty.toLowerCase().includes(query) ||
      r.ingredients.some((i) => i.toLowerCase().includes(query)) ||
      r.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  res.json({
    recipes: filtered,
    total: filtered.length,
    skip: 0,
    limit: filtered.length,
  });
});

// GET /api/recipes/:id
app.get('/api/recipes/:id', (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);
  const found = recipesList.find((r) => r.id === id);
  if (!found) {
    res.status(404).json({ error: `Recipe with id ${id} not found` });
    return;
  }
  res.json(found);
});

// POST /api/recipes/add
app.post('/api/recipes/add', (req: Request, res: Response) => {
  const newRecipe: RecipeDTO = {
    id: recipesList.length + 1,
    ...req.body,
    rating: 4.8,
    reviewCount: 1,
    userId: 1,
  };
  recipesList.push(newRecipe);
  res.status(201).json(newRecipe);
});


// System instruction making RecipeLoop AI an open-ended conversational companion with culinary mastery
const SYSTEM_INSTRUCTION = `You are RecipeLoop AI, an intelligent, friendly, and open-ended conversational AI companion embedded within the RecipeLoop app. 
Just like ChatGPT, you can converse naturally and comfortably about ANY topic the user brings up—everyday questions, science, creativity, problem-solving, jokes, or philosophy.
At the same time, you are a master chef and culinary expert with deep knowledge of worldwide cuisines, ingredients, dietary substitutions, meal planning, flavor profiles, and cooking techniques.
Guidelines:
- Converse naturally, warmly, and helpfully.
- When recipes or cooking techniques are discussed, provide clear, delicious, actionable guidance with organized ingredients and step-by-step instructions.
- If asked about non-culinary topics, answer enthusiastically and insightfully without artificial restrictions.
- Format responses nicely using markdown (bolding, lists, steps) so it looks clean in chat bubbles.
- Keep responses concise and engaging for mobile chat.`;

// POST /api/chat endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body as {
      message?: string;
      history?: ChatHistoryItem[];
    };

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not configured on the server.');
      res.status(500).json({
        error:
          'Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment.',
      });
      return;
    }

    // Build contents structure
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-10)) {
        if (item.content && (item.role === 'user' || item.role === 'model')) {
          contents.push({
            role: item.role,
            parts: [{ text: item.content }],
          });
        }
      }
    }

    // Append current message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'm sorry, I couldn't generate a response. Please try again.";
    res.json({ reply });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error during AI generation';
    console.error('Error in /api/chat:', errMessage);
    res.status(500).json({ error: errMessage });
  }
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: HOST, port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
  });
}

startServer();
