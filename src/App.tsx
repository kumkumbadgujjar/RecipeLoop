import React, { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { RecipeDetailScreen } from './screens/RecipeDetailScreen';
import { AiChatScreen } from './screens/AiChatScreen';

type ScreenState =
  | { type: 'home' }
  | { type: 'detail'; recipeId: number }
  | { type: 'ai' };

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(() => {
    const hash = window.location.hash;
    if (hash === '#ai') {
      return { type: 'ai' };
    }
    const match = hash.match(/^#recipe\/(\d+)$/);
    if (match) {
      return { type: 'detail', recipeId: parseInt(match[1], 10) };
    }
    return { type: 'home' };
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#ai') {
        setCurrentScreen({ type: 'ai' });
      } else {
        const match = hash.match(/^#recipe\/(\d+)$/);
        if (match) {
          setCurrentScreen({ type: 'detail', recipeId: parseInt(match[1], 10) });
        } else {
          setCurrentScreen({ type: 'home' });
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToDetail = (id: number) => {
    setCurrentScreen({ type: 'detail', recipeId: id });
    window.location.hash = `#recipe/${id}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateToAi = () => {
    setCurrentScreen({ type: 'ai' });
    window.location.hash = '#ai';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateBack = () => {
    setCurrentScreen({ type: 'home' });
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="w-full min-h-screen">
      {currentScreen.type === 'ai' ? (
        <AiChatScreen onBack={navigateBack} />
      ) : currentScreen.type === 'detail' ? (
        <RecipeDetailScreen
          recipeId={currentScreen.recipeId}
          onBack={navigateBack}
        />
      ) : (
        <HomeScreen
          onRecipeClick={navigateToDetail}
          onAiClick={navigateToAi}
        />
      )}
    </div>
  );
};

export default App;
