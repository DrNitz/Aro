import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Scan, 
  Plus, 
  Globe, 
  Sparkles, 
  Loader2, 
  Check, 
  X,
  Apple,
  Star,
  History,
  Bookmark,
  Trash2,
  Utensils
} from 'lucide-react';
import { CURATED_FOODS } from '../data/curatedFoods';
import { searchOpenFoodFacts } from '../services/openFoodFacts';
import { getTemplateTotals } from '../services/storage';
import FoodDetailModal from './FoodDetailModal';
import BarcodeScannerModal from './BarcodeScannerModal';

const MEAL_LABELS = {
  breakfast: '🍳 Breakfast',
  lunch: '🥗 Lunch',
  dinner: '🍽️ Dinner',
  snacks: '🍎 Snacks'
};

export default function FoodDatabaseView({
  targetMeal = 'breakfast',
  customFoods = [],
  onSaveCustomFood,
  onAddFoodToDiary,
  favoriteFoods = [],
  recentFoods = [],
  mealTemplates = [],
  onToggleFavorite,
  onDeleteMealTemplate,
  onLogTemplate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('all');
  const [selectedFood, setSelectedFood] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);

  // Live Open Food Facts API search state
  const [liveResults, setLiveResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchedQuery, setLiveSearchedQuery] = useState('');

  const favoriteIds = new Set((favoriteFoods || []).map((f) => f.id));
  const recentFoodList = (recentFoods || [])
    .map((r) => r.food)
    .filter(Boolean);

  // Combined local catalog
  const combinedLocalFoods = [...customFoods, ...CURATED_FOODS];

  const matchesQuery = (food) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      (food.name && food.name.toLowerCase().includes(q)) ||
      (food.brand && food.brand.toLowerCase().includes(q)) ||
      (food.category && food.category.toLowerCase().includes(q))
    );
  };

  // Filter local foods (used in the "All Foods" collection)
  const filteredLocalFoods = combinedLocalFoods.filter((food) => {
    if (!matchesQuery(food)) return false;
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'High Protein') return food.protein >= 15;
    if (selectedCategory === 'Low Calorie') return food.calories <= 60;
    return food.category && food.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Which foods are shown based on the active collection
  const displayedFoods =
    viewMode === 'favorites'
      ? favoriteFoods.filter(matchesQuery)
      : viewMode === 'recents'
        ? recentFoodList.filter(matchesQuery)
        : filteredLocalFoods;

  // Clear live search results when query is emptied
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveResults([]);
      setLiveSearchedQuery('');
    }
  }, [searchQuery]);

  // Immediate Search Open Food Facts Live (on Enter or Button click)
  const handleSearchOpenFoodFacts = async (e) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsSearchingLive(true);
    setLiveSearchedQuery(trimmed);
    try {
      const results = await searchOpenFoodFacts(trimmed, 24);
      setLiveResults(results);
    } catch (err) {
      console.error(err);
      setLiveResults([]);
    } finally {
      setIsSearchingLive(false);
    }
  };

  const collections = [
    { id: 'all', label: 'All Foods', icon: Apple, count: null },
    { id: 'favorites', label: 'Favorites', icon: Star, count: favoriteFoods.length },
    { id: 'recents', label: 'Recents', icon: History, count: recentFoodList.length },
    { id: 'templates', label: 'Meal Templates', icon: Bookmark, count: mealTemplates.length }
  ];

  const categories = [
    'All',
    'High Protein',
    'Low Calorie',
    'Meat & Poultry',
    'Fish & Seafood',
    'Dairy & Eggs',
    'Dairy Alternatives',
    'Fruits',
    'Fruits & Healthy Fats',
    'Vegetables',
    'Grains & Cereals',
    'Bakery',
    'Nuts & Seeds',
    'Plant Proteins',
    'Oils & Fats',
    'Spreads & Sweet',
    'Beverages',
    'Supplements'
  ];

  // Custom Food Form State
  const [customForm, setCustomForm] = useState({
    name: '',
    brand: 'Homemade / Custom',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    servingGrams: 100
  });

  const handleSaveCustom = (e) => {
    e.preventDefault();
    if (!customForm.name || !customForm.calories) return;

    const newFood = {
      id: `custom-${Date.now()}`,
      code: `custom-${Math.random().toString(36).substring(7)}`,
      name: customForm.name,
      brand: customForm.brand || 'Custom Recipe',
      category: 'Custom',
      calories: Number(customForm.calories),
      protein: Number(customForm.protein) || 0,
      carbs: Number(customForm.carbs) || 0,
      fat: Number(customForm.fat) || 0,
      fiber: Number(customForm.fiber) || 0,
      sugar: 0,
      sodium: 0,
      servingSize: 100,
      servingUnit: 'g',
      commonServing: { name: '1 Serving', grams: Number(customForm.servingGrams) || 100 },
      nutriscore: null,
      nova: null,
      image: null,
      isCustom: true
    };

    onSaveCustomFood(newFood);
    setShowCustomFoodModal(false);
    setSelectedFood(newFood);
  };

  // Reusable food card (used for live results, collections & local catalog)
  const renderFoodCard = (food) => {
    const isFav = favoriteIds.has(food.id);
    return (
      <div
        key={food.id}
        className="glass-card food-card"
        onClick={() => setSelectedFood(food)}
      >
        <div className="food-card-top">
          {food.image ? (
            <img
              src={food.image}
              alt={food.name}
              className="food-card-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="food-card-img-fallback">🥗</div>
          )}

          <div className="food-card-badges">
            {food.nutriscore && (
              <span className={`badge badge-nutriscore-${food.nutriscore}`}>
                Score {food.nutriscore.toUpperCase()}
              </span>
            )}
            {food.nova && (
              <span className={`badge badge-nova-${food.nova}`}>
                NOVA {food.nova}
              </span>
            )}
            {food.isCustom && (
              <span className="badge badge-purple">Custom</span>
            )}
          </div>
        </div>

        <div className="food-card-info">
          <h4 className="food-card-name" title={food.name}>{food.name}</h4>
          <span className="food-card-brand">{food.brand}</span>

          <div className="food-card-macros mono">
            <span className="macro-tag-cal">{food.calories} kcal</span>
            <span className="text-protein">{food.protein}g P</span>
            <span className="text-carbs">{food.carbs}g C</span>
            <span className="text-fat">{food.fat}g F</span>
          </div>

          <div className="food-card-footer">
            <span className="per-100g-hint">per 100g</span>
            <button
              type="button"
              className={`food-card-fav-btn ${isFav ? 'is-fav' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(food);
              }}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    if (viewMode === 'favorites') {
      return (
        <div className="no-foods-card glass-card">
          <Star size={36} className="text-dim" />
          <p>No favorites yet. Tap the ⭐ on any food to save it here for one-tap logging.</p>
        </div>
      );
    }
    if (viewMode === 'recents') {
      return (
        <div className="no-foods-card glass-card">
          <History size={36} className="text-dim" />
          <p>Foods you log will show up here automatically for quick re-adding.</p>
        </div>
      );
    }
    if (isSearchingLive) {
      return (
        <div className="no-foods-card glass-card">
          <Loader2 size={32} className="spin text-cyan" />
          <p>Searching Open Food Facts global database for "{searchQuery}"...</p>
        </div>
      );
    }
    return (
      <div className="no-foods-card glass-card">
        <Apple size={36} className="text-dim" />
        <p>No verified local foods match "{searchQuery}".</p>
        <button className="btn btn-primary btn-sm" onClick={handleSearchOpenFoodFacts} disabled={isSearchingLive}>
          <Globe size={15} />
          <span>Search Open Food Facts API for "{searchQuery}"</span>
        </button>
      </div>
    );
  };

  const renderTemplates = () => {
    if (mealTemplates.length === 0) {
      return (
        <div className="no-foods-card glass-card">
          <Bookmark size={36} className="text-dim" />
          <p>
            No meal templates yet. Open a meal in your Diary and tap the
            <Bookmark size={14} style={{ verticalAlign: 'middle', margin: '0 3px' }} />
            save button to reuse it in one tap.
          </p>
        </div>
      );
    }

    return (
      <div className="templates-grid grid-3">
        {mealTemplates.map((tpl) => {
          const totals = getTemplateTotals(tpl);
          const mealLabel = MEAL_LABELS[tpl.mealType] || 'Meal';
          return (
            <div key={tpl.id} className="glass-card template-card">
              <div className="template-card-head">
                <div className="template-icon-pill">
                  <Bookmark size={16} />
                </div>
                <div className="template-head-text">
                  <h4 className="template-name" title={tpl.name}>{tpl.name}</h4>
                  <span className="template-meta">{mealLabel} • {totals.count} items</span>
                </div>
                <button
                  className="btn-delete-item"
                  onClick={() => onDeleteMealTemplate && onDeleteMealTemplate(tpl.id)}
                  title="Delete template"
                  aria-label="Delete template"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="template-totals mono">
                <span className="macro-tag-cal">{Math.round(totals.calories)} kcal</span>
                <span className="text-protein">{Math.round(totals.protein)}g P</span>
                <span className="text-carbs">{Math.round(totals.carbs)}g C</span>
                <span className="text-fat">{Math.round(totals.fat)}g F</span>
              </div>

              <div className="template-items-preview">
                {tpl.items.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="template-item-chip" title={item.name}>
                    {item.name}
                  </span>
                ))}
                {tpl.items.length > 3 && (
                  <span className="template-item-more">+{tpl.items.length - 3} more</span>
                )}
              </div>

              <button
                className="btn btn-primary btn-sm template-log-btn"
                onClick={() => onLogTemplate && onLogTemplate(tpl)}
              >
                <Utensils size={14} />
                <span>Log to {mealLabel}</span>
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const sectionTitle =
    viewMode === 'favorites'
      ? 'Your Favorite Foods'
      : viewMode === 'recents'
        ? 'Recently Logged Foods'
        : viewMode === 'templates'
          ? 'Saved Meal Templates'
          : 'Verified Staples & Offline Database';

  return (
    <div className="food-database-view">
      {/* Search Header Banner */}
      <div className="food-search-banner glass-card">
        <div className="search-banner-top">
          <div>
            <h2 className="banner-title">Food & Nutrition Database</h2>
            <p className="banner-sub">
              Search verified staples or query over 3,000,000 products live via Open Food Facts
            </p>
          </div>

          <div className="banner-actions">
            <button 
              className="btn btn-outline-primary"
              onClick={() => setShowBarcodeScanner(true)}
            >
              <Scan size={17} />
              <span>Barcode Scanner</span>
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => setShowCustomFoodModal(true)}
            >
              <Plus size={17} />
              <span>New Custom Food</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchOpenFoodFacts} className="search-input-wrapper">
          <div className="search-field-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foods, dishes, or brands (e.g. Roti, Chips, Greek Yogurt)..."
              className="food-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => { setSearchQuery(''); setLiveResults([]); }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary search-off-btn"
            disabled={isSearchingLive || !searchQuery.trim()}
          >
            {isSearchingLive ? <Loader2 size={16} className="spin" /> : <Globe size={16} />}
            <span>Search Online</span>
          </button>
        </form>

        {/* Collection Tabs */}
        <div className="collection-tabs-row">
          {collections.map((col) => {
            const Icon = col.icon;
            const isActive = viewMode === col.id;
            return (
              <button
                key={col.id}
                className={`collection-tab ${isActive ? 'collection-tab-active' : ''}`}
                onClick={() => setViewMode(col.id)}
              >
                <Icon size={15} fill={col.id === 'favorites' && isActive ? 'currentColor' : 'none'} />
                <span>{col.label}</span>
                {col.count !== null && col.count > 0 && (
                  <span className="collection-count mono">{col.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category Filter Pills (for the full catalog only) */}
        {viewMode === 'all' && (
          <div className="category-chips-row">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${selectedCategory === cat ? 'category-chip-active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Open Food Facts Results (If searched) */}
      {liveResults.length > 0 && viewMode === 'all' && (
        <div className="live-results-section">
          <div className="results-header-row">
            <div className="results-title-group">
              <Globe size={18} className="text-cyan" />
              <h3 className="results-title">Open Food Facts Live Results for "{liveSearchedQuery}"</h3>
            </div>
            <span className="results-count mono">{liveResults.length} products found</span>
          </div>

          <div className="food-cards-grid grid-3">
            {liveResults.map((food) => renderFoodCard(food))}
          </div>
        </div>
      )}

      {/* Curated / Collections Section */}
      <div className="local-results-section">
        <div className="results-header-row">
          <div className="results-title-group">
            {viewMode === 'favorites' ? (
              <Star size={18} className="text-amber" fill="currentColor" />
            ) : viewMode === 'recents' ? (
              <History size={18} className="text-cyan" />
            ) : viewMode === 'templates' ? (
              <Bookmark size={18} className="text-primary" />
            ) : (
              <Sparkles size={18} className="text-amber" />
            )}
            <h3 className="results-title">{sectionTitle}</h3>
          </div>
          <span className="results-count mono">
            {viewMode === 'templates' ? `${mealTemplates.length} templates` : `${displayedFoods.length} items`}
          </span>
        </div>

        {viewMode === 'templates' ? (
          renderTemplates()
        ) : displayedFoods.length > 0 ? (
          <div className="food-cards-grid grid-3">
            {displayedFoods.map((food) => renderFoodCard(food))}
          </div>
        ) : viewMode === 'all' && liveResults.length > 0 ? (
          <div className="no-foods-card glass-card" style={{ padding: '16px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {liveResults.length} Open Food Facts products for "{searchQuery}" above.
            </p>
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>

      {/* Food Details & Portion Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          initialMealType={targetMeal}
          onClose={() => setSelectedFood(null)}
          onAddFood={onAddFoodToDiary}
        />
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScannerModal
          onClose={() => setShowBarcodeScanner(false)}
          onProductFound={(product) => {
            setShowBarcodeScanner(false);
            setSelectedFood(product);
          }}
        />
      )}

      {/* Create Custom Food Modal */}
      {showCustomFoodModal && (
        <div className="modal-overlay" onClick={() => setShowCustomFoodModal(false)}>
          <div className="modal-card custom-food-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-product-title">Create Custom Food / Recipe</h3>
              <button className="btn-icon btn-secondary" onClick={() => setShowCustomFoodModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustom}>
              <div className="modal-body custom-form-grid">
                <div className="input-group">
                  <label className="input-label">Food / Recipe Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Homemade Protein Pancake"
                    value={customForm.name}
                    onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Brand / Source (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mom's Kitchen"
                    value={customForm.brand}
                    onChange={(e) => setCustomForm({ ...customForm, brand: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Calories (kcal per 100g) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 210"
                      value={customForm.calories}
                      onChange={(e) => setCustomForm({ ...customForm, calories: e.target.value })}
                      className="input-field mono"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Protein (g per 100g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 18.5"
                      value={customForm.protein}
                      onChange={(e) => setCustomForm({ ...customForm, protein: e.target.value })}
                      className="input-field mono"
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="input-group">
                    <label className="input-label">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 24"
                      value={customForm.carbs}
                      onChange={(e) => setCustomForm({ ...customForm, carbs: e.target.value })}
                      className="input-field mono"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5.5"
                      value={customForm.fat}
                      onChange={(e) => setCustomForm({ ...customForm, fat: e.target.value })}
                      className="input-field mono"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Fiber (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 3.2"
                      value={customForm.fiber}
                      onChange={(e) => setCustomForm({ ...customForm, fiber: e.target.value })}
                      className="input-field mono"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCustomFoodModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Save Food</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
