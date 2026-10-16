import React, { useState } from 'react';
import { X, Check, Flame, Plus, Minus, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FoodDetailModal({
  food,
  initialMealType = 'breakfast',
  onClose,
  onAddFood
}) {
  const [mealType, setMealType] = useState(initialMealType);
  const [grams, setGrams] = useState(food.commonServing?.grams || 100);

  if (!food) return null;

  const factor = (grams || 0) / 100;

  const currentCalories = Math.round(food.calories * factor);
  const currentProtein = parseFloat((food.protein * factor).toFixed(1));
  const currentCarbs = parseFloat((food.carbs * factor).toFixed(1));
  const currentFat = parseFloat((food.fat * factor).toFixed(1));
  const currentSaturatedFat = parseFloat(((food.saturatedFat || 0) * factor).toFixed(1));
  const currentFiber = parseFloat(((food.fiber || 0) * factor).toFixed(1));
  const currentSugar = parseFloat(((food.sugar || 0) * factor).toFixed(1));
  const currentSodium = Math.round((food.sodium || 0) * factor);
  const currentPotassium = Math.round((food.potassium || 0) * factor);
  const currentCalcium = Math.round((food.calcium || 0) * factor);
  const currentMagnesium = Math.round((food.magnesium || 0) * factor);

  const handleLogFood = () => {
    // trigger celebration confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#38bdf8', '#8b5cf6']
      });
    } catch {
      // ignore
    }

    onAddFood({
      id: `log-${food.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      foodId: food.id,
      name: food.name,
      brand: food.brand,
      grams: Number(grams),
      calories: currentCalories,
      protein: currentProtein,
      carbs: currentCarbs,
      fat: currentFat,
      saturatedFat: currentSaturatedFat,
      fiber: currentFiber,
      sugar: currentSugar,
      sodium: currentSodium,
      potassium: currentPotassium,
      calcium: currentCalcium,
      magnesium: currentMagnesium,
      image: food.image,
      nutriscore: food.nutriscore,
      nova: food.nova,
      mealType
    }, food);

    onClose();
  };

  const getNutriscoreColor = (grade) => {
    switch (grade) {
      case 'a': return '#038141';
      case 'b': return '#85bb2f';
      case 'c': return '#fecb02';
      case 'd': return '#ee8100';
      case 'e': return '#e63e11';
      default: return '#64748b';
    }
  };

  const quickPortions = [
    { label: '50g', val: 50 },
    { label: '100g', val: 100 },
    { label: '150g', val: 150 },
    { label: '200g', val: 200 },
    ...(food.commonServing?.grams ? [{ label: food.commonServing.name, val: food.commonServing.grams }] : [])
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card food-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 className="modal-product-title">{food.name}</h3>
            {food.brand && <span className="modal-product-brand">{food.brand}</span>}
          </div>
          <button className="btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Top Banner with Image and Scores */}
          <div className="modal-food-banner">
            {food.image ? (
              <img src={food.image} alt={food.name} className="modal-food-img" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div className="modal-food-img-fallback">🥗</div>
            )}

            <div className="modal-badges-col">
              {food.nutriscore && (
                <div className="score-box" style={{ borderColor: getNutriscoreColor(food.nutriscore) }}>
                  <span className="score-tag">Nutri-Score</span>
                  <span 
                    className="score-val" 
                    style={{ background: getNutriscoreColor(food.nutriscore) }}
                  >
                    {food.nutriscore.toUpperCase()}
                  </span>
                </div>
              )}

              {food.nova && (
                <div className="score-box nova-box">
                  <span className="score-tag">NOVA Group</span>
                  <span className={`badge badge-nova-${food.nova}`}>
                    Group {food.nova}
                  </span>
                </div>
              )}

              <span className="calories-badge-big mono">
                <Flame size={18} className="text-coral" />
                <strong>{currentCalories}</strong> kcal
              </span>
            </div>
          </div>

          {/* Portion Selector */}
          <div className="portion-control-card glass-card">
            <label className="input-label">Select Serving / Quantity (grams)</label>
            <div className="portion-input-row">
              <button 
                className="btn btn-secondary btn-icon" 
                onClick={() => setGrams(Math.max(10, Number(grams) - 10))}
              >
                <Minus size={16} />
              </button>
              
              <div className="portion-input-wrap">
                <input
                  type="number"
                  min="1"
                  max="2000"
                  value={grams}
                  onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                  className="input-field portion-num-input mono"
                />
                <span className="portion-unit">grams</span>
              </div>

              <button 
                className="btn btn-secondary btn-icon" 
                onClick={() => setGrams(Number(grams) + 10)}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="quick-portion-chips">
              {quickPortions.map((p, idx) => (
                <button
                  key={idx}
                  className={`portion-chip ${grams === p.val ? 'portion-chip-active' : ''}`}
                  onClick={() => setGrams(p.val)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Macro Pillars */}
          <div className="macro-pillars-grid">
            <div className="macro-pillar">
              <span className="pillar-label">Protein</span>
              <span className="pillar-val mono text-protein">{currentProtein}g</span>
              <div className="pillar-bar-wrap">
                <div className="pillar-bar bar-protein" style={{ width: `${Math.min(100, currentProtein * 2.5)}%` }}></div>
              </div>
            </div>

            <div className="macro-pillar">
              <span className="pillar-label">Carbs</span>
              <span className="pillar-val mono text-carbs">{currentCarbs}g</span>
              <div className="pillar-bar-wrap">
                <div className="pillar-bar bar-carbs" style={{ width: `${Math.min(100, currentCarbs * 2.5)}%` }}></div>
              </div>
            </div>

            <div className="macro-pillar">
              <span className="pillar-label">Fat</span>
              <span className="pillar-val mono text-fat">{currentFat}g</span>
              <div className="pillar-bar-wrap">
                <div className="pillar-bar bar-fat" style={{ width: `${Math.min(100, currentFat * 2.5)}%` }}></div>
              </div>
            </div>

            <div className="macro-pillar">
              <span className="pillar-label">Fiber</span>
              <span className="pillar-val mono text-fiber">{currentFiber}g</span>
              <div className="pillar-bar-wrap">
                <div className="pillar-bar bar-fiber" style={{ width: `${Math.min(100, currentFiber * 5)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Detailed Micronutrients Breakdown */}
          <div className="micro-nutrition-panel">
            <h4 className="panel-sub-title">Detailed Nutritional Facts ({grams}g)</h4>
            <div className="nutrition-facts-table">
              <div className="fact-row">
                <span>Sugars</span>
                <span className="mono">{currentSugar}g</span>
              </div>
              <div className="fact-row">
                <span>Sodium</span>
                <span className="mono">{currentSodium}mg</span>
              </div>
              <div className="fact-row">
                <span>Energy in kJ</span>
                <span className="mono">{Math.round(currentCalories * 4.184)} kJ</span>
              </div>
              {food.code && (
                <div className="fact-row">
                  <span>Product Code / Barcode</span>
                  <span className="mono text-dim">{food.code}</span>
                </div>
              )}
            </div>
          </div>

          {/* Meal Target Selector */}
          <div className="meal-target-selector">
            <label className="input-label">Select Meal in Diary</label>
            <div className="meal-choice-buttons">
              {[
                { id: 'breakfast', label: '🍳 Breakfast' },
                { id: 'lunch', label: '🥗 Lunch' },
                { id: 'dinner', label: '🍽️ Dinner' },
                { id: 'snacks', label: '🍎 Snacks' },
              ].map((m) => (
                <button
                  key={m.id}
                  className={`meal-choice-btn ${mealType === m.id ? 'meal-choice-active' : ''}`}
                  onClick={() => setMealType(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleLogFood}>
            <Check size={16} />
            <span>Log {currentCalories} kcal to {mealType.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
