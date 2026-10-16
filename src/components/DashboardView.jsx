import React, { useState, useEffect } from 'react';
import MacroRing from './MacroRing';
import ClinicalAuditPanel from './ClinicalAuditPanel';
import { getTemplateTotals } from '../services/storage';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Droplet, 
  Flame, 
  Dumbbell, 
  Sparkles, 
  ChevronRight, 
  Coffee, 
  Sun, 
  Moon, 
  Apple, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Utensils,
  X,
  Check
} from 'lucide-react';

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks'
};

export default function DashboardView({
  diary,
  profile,
  onUpdateDiary,
  onOpenAddFood,
  onOpenLogWorkout,
  fastingState,
  onUpdateFasting,
  mealTemplates = [],
  onSaveMealTemplate,
  onLogTemplate
}) {
  // Calculate Totals for the day
  const meals = diary.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] };
  const workouts = diary.workouts || [];
  const waterMl = diary.waterMl || 0;

  const allFoodLogs = [
    ...(meals.breakfast || []),
    ...(meals.lunch || []),
    ...(meals.dinner || []),
    ...(meals.snacks || [])
  ];

  const totalCaloriesEaten = allFoodLogs.reduce((acc, item) => acc + (item.calories || 0), 0);
  const totalProteinEaten = allFoodLogs.reduce((acc, item) => acc + (item.protein || 0), 0);
  const totalCarbsEaten = allFoodLogs.reduce((acc, item) => acc + (item.carbs || 0), 0);
  const totalFatEaten = allFoodLogs.reduce((acc, item) => acc + (item.fat || 0), 0);
  const totalFiberEaten = allFoodLogs.reduce((acc, item) => acc + (item.fiber || 0), 0);
  const totalSodium = allFoodLogs.reduce((acc, item) => acc + (item.sodium || 0), 0);
  const totalPotassium = allFoodLogs.reduce((acc, item) => acc + (item.potassium || 0), 0);
  const totalSaturatedFat = allFoodLogs.reduce((acc, item) => acc + (item.saturatedFat || 0), 0);
  const totalCalcium = allFoodLogs.reduce((acc, item) => acc + (item.calcium || 0), 0);
  const totalMagnesium = allFoodLogs.reduce((acc, item) => acc + (item.magnesium || 0), 0);
  const totalSugar = allFoodLogs.reduce((acc, item) => acc + (item.sugar || 0), 0);

  const totalCaloriesBurned = workouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);

  // Active Clinical Protocol state
  const [activeProtocolId, setActiveProtocolId] = useState(() => {
    return localStorage.getItem('aro_active_clinical_protocol') || 'aha_standard';
  });

  const handleSelectProtocol = (id) => {
    setActiveProtocolId(id);
    localStorage.setItem('aro_active_clinical_protocol', id);
  };

  // Water Handling
  const handleAddWater = (amountMl) => {
    onUpdateDiary({
      ...diary,
      waterMl: Math.max(0, waterMl + amountMl)
    });
  };

  const handleResetWater = () => {
    onUpdateDiary({
      ...diary,
      waterMl: 0
    });
  };

  // Fasting Elapsed Timer
  const [elapsedFastingSeconds, setElapsedFastingSeconds] = useState(0);

  useEffect(() => {
    if (!fastingState.isFasting || !fastingState.startTime) {
      setElapsedFastingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - fastingState.startTime) / 1000);
      setElapsedFastingSeconds(Math.max(0, elapsed));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [fastingState]);

  const toggleFasting = () => {
    if (fastingState.isFasting) {
      onUpdateFasting({
        ...fastingState,
        isFasting: false
      });
    } else {
      onUpdateFasting({
        ...fastingState,
        isFasting: true,
        startTime: Date.now()
      });
    }
  };

  const formatFastingTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const fastingTargetSeconds = (fastingState.targetHours || 16) * 3600;
  const fastingProgressPercent = Math.min(100, Math.round((elapsedFastingSeconds / fastingTargetSeconds) * 100));

  const getFastingStage = (hours) => {
    if (hours < 4) return "Digestive Phase (Blood sugar normalizes)";
    if (hours < 12) return "Fat Burning Prep (Insulin drops)";
    if (hours < 16) return "Ketosis & Accelerated Fat Burning";
    return "Deep Autophagy & Cellular Renewal";
  };

  // Meal template save modal
  const [templateModalMeal, setTemplateModalMeal] = useState(null);
  const [templateName, setTemplateName] = useState('');

  const openTemplateModal = (mealKey) => {
    setTemplateModalMeal(mealKey);
    setTemplateName(`${MEAL_LABELS[mealKey] || 'Meal'} Favorites`);
  };

  const handleConfirmTemplate = () => {
    if (!templateModalMeal) return;
    const items = meals[templateModalMeal] || [];
    if (onSaveMealTemplate) {
      onSaveMealTemplate(
        templateName.trim() || `${MEAL_LABELS[templateModalMeal] || 'Meal'} Template`,
        templateModalMeal,
        items
      );
    }
    setTemplateModalMeal(null);
    setTemplateName('');
  };

  // Delete Food Item
  const handleDeleteFood = (mealType, itemId) => {
    const updatedMeal = (meals[mealType] || []).filter(item => item.id !== itemId);
    onUpdateDiary({
      ...diary,
      meals: {
        ...meals,
        [mealType]: updatedMeal
      }
    });
  };

  // Delete Workout
  const handleDeleteWorkout = (workoutId) => {
    const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
    onUpdateDiary({
      ...diary,
      workouts: updatedWorkouts
    });
  };

  const mealSections = [
    { key: 'breakfast', title: 'Breakfast', icon: Coffee, desc: 'Fuel your morning' },
    { key: 'lunch', title: 'Lunch', icon: Sun, desc: 'Midday energy balance' },
    { key: 'dinner', title: 'Dinner', icon: Moon, desc: 'Evening replenishment' },
    { key: 'snacks', title: 'Snacks & Extras', icon: Apple, desc: 'Pre/post workout bites' },
  ];

  return (
    <div className="dashboard-view">
      {/* Hero Macro Ring & Equation Card */}
      <MacroRing
        caloriesEaten={totalCaloriesEaten}
        caloriesBurned={totalCaloriesBurned}
        targetCalories={profile.targetCalories || 2150}
        proteinEaten={totalProteinEaten}
        targetProtein={profile.targetProtein || 160}
        carbsEaten={totalCarbsEaten}
        targetCarbs={profile.targetCarbs || 215}
        fatEaten={totalFatEaten}
        targetFat={profile.targetFat || 65}
        fiberEaten={totalFiberEaten}
        targetFiber={profile.targetFiber || 30}
      />

      {/* Two Widgets: Fasting Timer & Water Tracker */}
      <div className="widgets-grid grid-2">
        {/* Fasting Widget */}
        <div className="glass-card widget-card fasting-card">
          <div className="card-header">
            <div className="card-title">
              <Clock className="text-purple" size={20} />
              <span>Intermittent Fasting</span>
            </div>
            <span className="badge badge-purple">{fastingState.targetHours || 16}:8 Fast</span>
          </div>

          <div className="card-body widget-body-flex">
            <div className="fasting-timer-display">
              <div className="fasting-ring-wrapper">
                <svg className="fasting-ring-svg" width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="46" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="8" fill="none" />
                  <circle
                    cx="55"
                    cy="55"
                    r="46"
                    stroke="#8b5cf6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - fastingProgressPercent / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                  />
                </svg>
                <div className="fasting-ring-center">
                  <span className="fasting-percent mono">{fastingProgressPercent}%</span>
                </div>
              </div>

              <div className="fasting-info">
                <span className="fasting-status-title">
                  {fastingState.isFasting ? 'Fast in Progress' : 'Eating Window Active'}
                </span>
                <span className="fasting-clock mono">
                  {fastingState.isFasting ? formatFastingTime(elapsedFastingSeconds) : 'Ready to begin'}
                </span>
                <span className="fasting-stage-hint">
                  {fastingState.isFasting 
                    ? getFastingStage(elapsedFastingSeconds / 3600) 
                    : 'Target 16 hours fasting for metabolic flexibility'}
                </span>
              </div>
            </div>

            <div className="widget-action-row">
              <button
                className={`btn ${fastingState.isFasting ? 'btn-danger' : 'btn-primary'} btn-sm`}
                onClick={toggleFasting}
              >
                {fastingState.isFasting ? <Pause size={14} /> : <Play size={14} />}
                <span>{fastingState.isFasting ? 'End Fast' : 'Start Fast'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Water Tracker Widget */}
        <div className="glass-card widget-card water-card">
          <div className="card-header">
            <div className="card-title">
              <Droplet className="text-cyan" size={20} />
              <span>Hydration Tracker</span>
            </div>
            <span className="water-header-val mono">
              <strong>{waterMl}</strong> / {profile.targetWaterMl || 3000} ml
            </span>
          </div>

          <div className="card-body widget-body-flex">
            <div className="water-reservoir-wrapper">
              <div className="water-fill-visual">
                <div 
                  className="water-liquid"
                  style={{ height: `${Math.min(100, Math.round((waterMl / (profile.targetWaterMl || 3000)) * 100))}%` }}
                >
                  <div className="water-wave"></div>
                </div>
              </div>

              <div className="water-stats-col">
                <span className="water-percent-big font-display">
                  {Math.round((waterMl / (profile.targetWaterMl || 3000)) * 100)}%
                </span>
                <span className="water-stat-sub">
                  {profile.targetWaterMl - waterMl > 0 
                    ? `${profile.targetWaterMl - waterMl} ml remaining` 
                    : 'Daily hydration goal complete! 💧'}
                </span>
                <div className="water-quick-buttons">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleAddWater(250)}>
                    +250 ml (Cup)
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleAddWater(500)}>
                    +500 ml (Bottle)
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleAddWater(750)}>
                    +750 ml
                  </button>
                  {waterMl > 0 && (
                    <button className="btn btn-danger btn-sm" onClick={handleResetWater} title="Reset Water">
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor's Micronutrient & Electrolyte Clinical Audit */}
      <ClinicalAuditPanel
        totals={{
          sodium: totalSodium,
          potassium: totalPotassium,
          fiber: totalFiberEaten,
          saturatedFat: totalSaturatedFat,
          calcium: totalCalcium,
          magnesium: totalMagnesium,
          sugar: totalSugar
        }}
        totalCaloriesEaten={totalCaloriesEaten}
        activeProtocolId={activeProtocolId}
        onSelectProtocol={handleSelectProtocol}
      />

      {/* Quick Log Saved Meal Templates */}
      {mealTemplates.length > 0 && (
        <div className="templates-strip-wrap glass-card">
          <div className="templates-strip-head">
            <div className="results-title-group">
              <Bookmark size={16} className="text-primary" />
              <span className="templates-strip-title">Quick Log a Saved Meal</span>
            </div>
            <span className="templates-strip-sub">One tap to re-add a full meal</span>
          </div>
          <div className="templates-strip">
            {mealTemplates.map((tpl) => {
              const totals = getTemplateTotals(tpl);
              return (
                <button
                  key={tpl.id}
                  className="template-chip"
                  onClick={() => onLogTemplate && onLogTemplate(tpl)}
                  title={`Log "${tpl.name}" to ${MEAL_LABELS[tpl.mealType] || 'meal'}`}
                >
                  <span className="template-chip-icon">
                    <Utensils size={14} />
                  </span>
                  <span className="template-chip-text">
                    <span className="template-chip-name">{tpl.name}</span>
                    <span className="template-chip-meta mono">
                      {totals.count} items • {Math.round(totals.calories)} kcal
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Meals Log Section */}
      <div className="meals-section-header">
        <h2 className="section-title">Today's Meals & Nutrition</h2>
        <span className="section-subtitle">Track your macros per meal</span>
      </div>

      <div className="meals-list-container">
        {mealSections.map((sec) => {
          const items = meals[sec.key] || [];
          const mealCalories = items.reduce((sum, i) => sum + (i.calories || 0), 0);
          const mealProtein = items.reduce((sum, i) => sum + (i.protein || 0), 0);
          const mealCarbs = items.reduce((sum, i) => sum + (i.carbs || 0), 0);
          const mealFat = items.reduce((sum, i) => sum + (i.fat || 0), 0);
          const Icon = sec.icon;

          return (
            <div key={sec.key} className="glass-card meal-block">
              <div className="meal-block-header">
                <div className="meal-title-group">
                  <div className="meal-icon-pill">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="meal-name">{sec.title}</h3>
                    <span className="meal-sub">{sec.desc}</span>
                  </div>
                </div>

                <div className="meal-header-right">
                  <div className="meal-macros-pill mono">
                    <span className="meal-cal-val">{mealCalories} kcal</span>
                    <span className="meal-macro-div">|</span>
                    <span className="text-protein">{Math.round(mealProtein)}P</span>
                    <span className="text-carbs">{Math.round(mealCarbs)}C</span>
                    <span className="text-fat">{Math.round(mealFat)}F</span>
                  </div>

                  {items.length > 0 && onSaveMealTemplate && (
                    <button 
                      className="btn btn-secondary btn-sm meal-save-tpl-btn"
                      onClick={() => openTemplateModal(sec.key)}
                      title={`Save ${sec.title} as a reusable meal template`}
                    >
                      <Bookmark size={14} />
                      <span className="btn-label-hide-sm">Save</span>
                    </button>
                  )}

                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => onOpenAddFood(sec.key)}
                  >
                    <Plus size={15} />
                    <span>Add Food</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="meal-items-wrap">
                {items.length === 0 ? (
                  <div className="meal-empty-hint" onClick={() => onOpenAddFood(sec.key)}>
                    <Plus size={16} className="text-dim" />
                    <span>No food logged yet for {sec.title.toLowerCase()}. Tap to add.</span>
                  </div>
                ) : (
                  <div className="food-items-table">
                    {items.map((item) => (
                      <div key={item.id} className="food-item-row">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="food-thumb" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="food-thumb-fallback">🥗</div>
                        )}

                        <div className="food-meta">
                          <span className="food-name">{item.name}</span>
                          <div className="food-sub-row">
                            <span className="food-portion">{item.grams}g</span>
                            {item.brand && <span className="food-brand">• {item.brand}</span>}
                            {item.nutriscore && (
                              <span className={`badge badge-nutriscore-${item.nutriscore}`}>
                                Nutri-Score {item.nutriscore.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="food-item-macros mono">
                          <span className="food-item-cal">{item.calories} kcal</span>
                          <span className="food-item-p text-protein">{item.protein}g P</span>
                          <span className="food-item-c text-carbs">{item.carbs}g C</span>
                          <span className="food-item-f text-fat">{item.fat}g F</span>
                        </div>

                        <button 
                          className="btn-delete-item"
                          onClick={() => handleDeleteFood(sec.key, item.id)}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity & Workout Section */}
      <div className="activity-section-wrap glass-card">
        <div className="card-header">
          <div className="card-title">
            <Dumbbell className="text-cyan" size={20} />
            <span>Today's Workouts & Activity</span>
          </div>

          <div className="activity-header-right">
            <div className="activity-cal-pill mono">
              <Flame size={16} className="text-coral" />
              <span>{totalCaloriesBurned} kcal burned</span>
            </div>
            <button className="btn btn-outline-primary btn-sm" onClick={onOpenLogWorkout}>
              <Plus size={15} />
              <span>Log Exercise</span>
            </button>
          </div>
        </div>

        <div className="card-body">
          {workouts.length === 0 ? (
            <div className="empty-workouts-box" onClick={onOpenLogWorkout}>
              <Dumbbell size={28} className="text-dim" />
              <p>No workouts recorded for today yet.</p>
              <span className="text-muted font-sm">Log resistance sets or cardio activities to calculate calorie burn</span>
            </div>
          ) : (
            <div className="workouts-list">
              {workouts.map((w) => (
                <div key={w.id} className="workout-log-card">
                  <div className="workout-log-left">
                    <div className="workout-icon-badge">
                      <Dumbbell size={16} />
                    </div>
                    <div>
                      <h4 className="workout-title">{w.exerciseName}</h4>
                      <div className="workout-sub-info">
                        {w.type === 'strength' && w.sets && (
                          <span>
                            {w.sets.length} Sets • Max 1RM est: {w.estimatedOneRepMax} kg • Volume: {w.totalVolumeKg} kg
                          </span>
                        )}
                        {w.type === 'cardio' && (
                          <span>
                            {w.durationMinutes} min • MET {w.met || 7.0}
                          </span>
                        )}
                        {w.time && <span>• {w.time}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="workout-log-right">
                    <span className="workout-burned-badge mono">
                      <Flame size={14} className="text-coral" />
                      +{w.caloriesBurned} kcal
                    </span>
                    <button 
                      className="btn-delete-item"
                      onClick={() => handleDeleteWorkout(w.id)}
                      title="Delete workout"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Meal as Template Modal */}
      {templateModalMeal && (
        <div className="modal-overlay" onClick={() => setTemplateModalMeal(null)}>
          <div className="modal-card save-template-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-product-title">Save Meal Template</h3>
                <span className="modal-product-brand">
                  {MEAL_LABELS[templateModalMeal] || 'Meal'} • {(meals[templateModalMeal] || []).length} items
                </span>
              </div>
              <button className="btn-icon btn-secondary" onClick={() => setTemplateModalMeal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Template Name</label>
                <input
                  type="text"
                  autoFocus
                  className="input-field"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Weekday Breakfast"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmTemplate(); }}
                />
              </div>
              <p className="template-modal-hint">
                You can re-log every item in this meal with a single tap from your Diary or the
                Food &amp; Nutrition tab.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setTemplateModalMeal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmTemplate}>
                <Check size={16} />
                <span>Save Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
