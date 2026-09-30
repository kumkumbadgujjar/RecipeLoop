import React, { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { RecipeDetailScreen } from './screens/RecipeDetailScreen';

export const App: React.FC = () => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#recipe\/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#recipe\/(\d+)$/);
      if (match) {
        setSelectedRecipeId(parseInt(match[1], 10));
      } else {
        setSelectedRecipeId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToDetail = (id: number) => {
    setSelectedRecipeId(id);
    window.location.hash = `#recipe/${id}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateBack = () => {
    setSelectedRecipeId(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="w-full min-h-screen">
      {selectedRecipeId !== null ? (
        <RecipeDetailScreen
          recipeId={selectedRecipeId}
          onBack={navigateBack}
        />
      ) : (
        <HomeScreen onRecipeClick={navigateToDetail} />
      )}
    </div>
  );
};

export default App;
