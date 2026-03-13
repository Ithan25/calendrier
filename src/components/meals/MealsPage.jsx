import { useState } from 'react';
import RecipeList from './RecipeList';
import ShoppingList from './ShoppingList';
import { ChefHat, ShoppingCart } from 'lucide-react';

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' | 'shopping'

  return (
    <div className="meals-page page-enter page-enter-active">
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="top-bar-title">Repas & Courses</div>
        </div>
      </div>

      <div style={{ padding: 'var(--space-4)' }}>
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            <ChefHat size={18} /> Recettes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'shopping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shopping')}
          >
            <ShoppingCart size={18} /> Liste de courses
          </button>
        </div>
      </div>

      <div className="meals-content" style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(var(--bottom-nav-height) + var(--space-4) + var(--safe-area-bottom))' }}>
        {activeTab === 'recipes' ? <RecipeList /> : <ShoppingList />}
      </div>
    </div>
  );
}
