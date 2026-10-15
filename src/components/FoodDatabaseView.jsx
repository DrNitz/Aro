import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Scan, 
  Plus, 
  Flame, 
  Filter, 
  Globe, 
  Sparkles, 
  Loader2, 
  Check, 
  X,
  Apple,
  Info
} from 'lucide-react';
import { CURATED_FOODS } from '../data/curatedFoods';
import { searchOpenFoodFacts } from '../services/openFoodFacts';
import FoodDetailModal from './FoodDetailModal';
import BarcodeScannerModal from './BarcodeScannerModal';

export default function FoodDatabaseView({
  targetMeal = 'breakfast',
  customFoods = [],
  onSaveCustomFood,
  onAddFoodToDiary
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);

  // Live Open Food Facts API search state
  const [liveResults, setLiveResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchedQuery, setLiveSearchedQuery] = useState('');

  // Combined local catalog
  const combinedLocalFoods = [...customFoods, ...CURATED_FOODS];

  // Filter local foods
  const filteredLocalFoods = combinedLocalFoods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (food.category && food.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'High Protein') return food.protein >= 15;
    if (selectedCategory === 'Low Calorie') return food.calories <= 60;
    return food.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Auto-search Open Food Facts live database with 400ms debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setLiveResults([]);
      setIsSearchingLive(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      setLiveSearchedQuery(trimmed);
      try {
        const results = await searchOpenFoodFacts(trimmed, 24);
        setLiveResults(results);
      } catch (err) {
        console.error('Error during live food search:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 400);

    return () => clearTimeout(timer);
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

  const categories = [
    'All',
    'High Protein',
    'Low Calorie',
    'Meat & Poultry',
    'Fish & Seafood',
    'Dairy & Eggs',
    'Fruits',
    'Vegetables',
    'Grains & Cereals',
    'Nuts & Seeds'
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

        {/* Category Filter Pills */}
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
      </div>

      {/* Live Open Food Facts Results (If searched) */}
      {liveResults.length > 0 && (
        <div className="live-results-section">
          <div className="results-header-row">
            <div className="results-title-group">
              <Globe size={18} className="text-cyan" />
              <h3 className="results-title">Open Food Facts Live Results for "{liveSearchedQuery}"</h3>
            </div>
            <span className="results-count mono">{liveResults.length} products found</span>
          </div>

          <div className="food-cards-grid grid-3">
            {liveResults.map((food) => (
              <div 
                key={food.id} 
                className="glass-card food-card"
                onClick={() => setSelectedFood(food)}
              >
                <div className="food-card-top">
                  {food.image ? (
                    <img src={food.image} alt={food.name} className="food-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="food-card-img-fallback">🍎</div>
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
                  </div>
                </div>

                <div className="food-card-info">
                  <h4 className="food-card-name" title={food.name}>{food.name}</h4>
                  <span className="food-card-brand">{food.brand || 'Open Food Facts'}</span>

                  <div className="food-card-macros mono">
                    <span className="macro-tag-cal">{food.calories} kcal</span>
                    <span className="text-protein">{food.protein}g P</span>
                    <span className="text-carbs">{food.carbs}g C</span>
                    <span className="text-fat">{food.fat}g F</span>
                  </div>

                  <span className="per-100g-hint">per 100g</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Local & Curated Foods */}
      <div className="local-results-section">
        <div className="results-header-row">
          <div className="results-title-group">
            <Sparkles size={18} className="text-amber" />
            <h3 className="results-title">Verified Staples & Offline Database</h3>
          </div>
          <span className="results-count mono">{filteredLocalFoods.length} items</span>
        </div>

        {isSearchingLive && liveResults.length === 0 ? (
          <div className="no-foods-card glass-card">
            <Loader2 size={32} className="spin text-cyan" />
            <p>Searching Open Food Facts global database for "{searchQuery}"...</p>
          </div>
        ) : filteredLocalFoods.length === 0 && liveResults.length === 0 ? (
          <div className="no-foods-card glass-card">
            <Apple size={36} className="text-dim" />
            <p>No verified local foods match "{searchQuery}".</p>
            <button className="btn btn-primary btn-sm" onClick={handleSearchOpenFoodFacts} disabled={isSearchingLive}>
              <Globe size={15} />
              <span>Search Open Food Facts API for "{searchQuery}"</span>
            </button>
          </div>
        ) : filteredLocalFoods.length === 0 && liveResults.length > 0 ? (
          <div className="no-foods-card glass-card" style={{ padding: '16px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {liveResults.length} Open Food Facts products for "{searchQuery}" above.
            </p>
          </div>
        ) : (
          <div className="food-cards-grid grid-3">
            {filteredLocalFoods.map((food) => (
              <div 
                key={food.id} 
                className="glass-card food-card"
                onClick={() => setSelectedFood(food)}
              >
                <div className="food-card-top">
                  {food.image ? (
                    <img src={food.image} alt={food.name} className="food-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="food-card-img-fallback">🥗</div>
                  )}

                  <div className="food-card-badges">
                    {food.nutriscore && (
                      <span className={`badge badge-nutriscore-${food.nutriscore}`}>
                        Score {food.nutriscore.toUpperCase()}
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

                  <span className="per-100g-hint">per 100g</span>
                </div>
              </div>
            ))}
          </div>
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
