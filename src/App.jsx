import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import FoodDatabaseView from './components/FoodDatabaseView';
import ExerciseDatabaseView from './components/ExerciseDatabaseView';
import BodyPlannerView from './components/BodyPlannerView';
import DataManagementModal from './components/DataManagementModal';
import WorkoutLoggerModal from './components/WorkoutLoggerModal';
import OnboardingModal from './components/OnboardingModal';
import { 
  getProfile, 
  saveProfile, 
  getDayDiary, 
  saveDayDiary, 
  getCustomFoods, 
  saveCustomFoods,
  getWeightHistory,
  logWeight,
  getFastingState,
  saveFastingState,
  getStoredTheme,
  saveStoredTheme,
  getFavoriteFoods,
  toggleFavoriteFood,
  getRecentFoods,
  addRecentFood,
  getMealTemplates,
  createMealTemplate,
  deleteMealTemplate
} from './services/storage';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState(getStoredTheme());
  const [activeTab, setActiveTab] = useState('diary');
  
  // Current active date (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);
  const [currentDate, setCurrentDate] = useState(todayStr);

  // Core Data States
  const [profile, setProfile] = useState(getProfile());
  const [diary, setDiary] = useState(getDayDiary(todayStr));
  const [customFoods, setCustomFoods] = useState(getCustomFoods());
  const [weightHistory, setWeightHistory] = useState(getWeightHistory());
  const [fastingState, setFastingState] = useState(getFastingState());
  const [favoriteFoods, setFavoriteFoods] = useState(getFavoriteFoods());
  const [recentFoods, setRecentFoods] = useState(getRecentFoods());
  const [mealTemplates, setMealTemplates] = useState(getMealTemplates());

  // First-time visitor clinical onboarding state
  const [showOnboardingModal, setShowOnboardingModal] = useState(() => {
    return !localStorage.getItem('aro_profile_setup_done');
  });

  // UI Flow States
  const [targetMealForAdd, setTargetMealForAdd] = useState('breakfast');
  const [showDataModal, setShowDataModal] = useState(false);
  const [quickWorkoutModal, setQuickWorkoutModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Apply Theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveStoredTheme(theme);
  }, [theme]);

  // Load Diary when currentDate changes
  useEffect(() => {
    const d = getDayDiary(currentDate);
    setDiary(d);
  }, [currentDate]);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Toast notification helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Update Diary handler
  const handleUpdateDiary = (newDiary) => {
    setDiary(newDiary);
    saveDayDiary(currentDate, newDiary);
  };

  // Update Profile handler
  const handleUpdateProfile = (newProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    showToast('Updated your personal calorie & macro targets! 🎯');
  };

  // Onboarding completion handler
  const handleCompleteOnboarding = (updatedProfile) => {
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
    localStorage.setItem('aro_profile_setup_done', 'true');
    setShowOnboardingModal(false);
    showToast(`Welcome! Your clinical baseline of ${updatedProfile.targetCalories} kcal has been activated! 🩺🎯`);
    setActiveTab('diary');
  };

  // Fasting update
  const handleUpdateFasting = (newFasting) => {
    setFastingState(newFasting);
    saveFastingState(newFasting);
  };

  // Weight Log handler
  const handleLogWeight = (dateStr, weightKg) => {
    logWeight(dateStr, weightKg);
    setWeightHistory(getWeightHistory());
    showToast(`Logged weigh-in: ${weightKg} kg on ${dateStr}`);
  };

  // Save Custom Food handler
  const handleSaveCustomFood = (food) => {
    const updated = [food, ...customFoods];
    setCustomFoods(updated);
    saveCustomFoods(updated);
    showToast(`Created custom recipe: ${food.name}!`);
  };

  // Add Food to Diary from search / detail modal
  const handleAddFoodToDiary = (foodLogItem, sourceFood) => {
    const meal = foodLogItem.mealType || targetMealForAdd || 'breakfast';
    const currentMealList = diary.meals?.[meal] || [];
    const updatedDiary = {
      ...diary,
      meals: {
        ...(diary.meals || {}),
        [meal]: [...currentMealList, foodLogItem]
      }
    };
    handleUpdateDiary(updatedDiary);

    // Remember this food in the "Recents" collection
    const foodToRemember = sourceFood || foodLogItem.food;
    if (foodToRemember && foodToRemember.id) {
      setRecentFoods(addRecentFood(foodToRemember));
    }

    showToast(`Added ${foodLogItem.name} (${foodLogItem.grams}g) to ${meal.toUpperCase()}! ✨`);
    setActiveTab('diary');
  };

  // Toggle a food in/out of Favorites
  const handleToggleFavorite = (food) => {
    if (!food) return;
    const updated = toggleFavoriteFood(food);
    setFavoriteFoods(updated);
    const nowFav = updated.some((f) => f.id === food.id);
    showToast(nowFav ? `Saved ${food.name} to Favorites ⭐` : `Removed ${food.name} from Favorites`);
  };

  // Save the current contents of a meal as a reusable template
  const handleSaveMealTemplate = (name, mealType, items) => {
    if (!items || items.length === 0) {
      showToast('Add some foods to this meal before saving a template.');
      return;
    }
    const { templates } = createMealTemplate(name, mealType, items);
    setMealTemplates(templates);
    showToast(`Saved "${name}" as a meal template 📋`);
  };

  // Delete a saved meal template
  const handleDeleteMealTemplate = (templateId) => {
    setMealTemplates(deleteMealTemplate(templateId));
    showToast('Meal template deleted.');
  };

  // Log every item of a template into the diary at once
  const handleLogTemplate = (template, mealOverride) => {
    if (!template) return;
    const meal = mealOverride || template.mealType || 'breakfast';
    const currentMealList = diary.meals?.[meal] || [];
    const stamped = (template.items || []).map((item, idx) => ({
      ...item,
      id: `log-tpl-${template.id}-${Date.now()}-${idx}`,
      mealType: meal
    }));
    const updatedDiary = {
      ...diary,
      meals: {
        ...(diary.meals || {}),
        [meal]: [...currentMealList, ...stamped]
      }
    };
    handleUpdateDiary(updatedDiary);
    const kcal = stamped.reduce((acc, i) => acc + (i.calories || 0), 0);
    showToast(`Logged "${template.name}" (${stamped.length} items, ${kcal} kcal) to ${meal.toUpperCase()}! 🍽️`);
    setActiveTab('diary');
  };

  // Log Workout to Diary handler
  const handleLogWorkoutToDiary = (workoutLogItem) => {
    const currentWorkouts = diary.workouts || [];
    const updatedDiary = {
      ...diary,
      workouts: [...currentWorkouts, workoutLogItem]
    };
    handleUpdateDiary(updatedDiary);
    showToast(`Logged workout: ${workoutLogItem.exerciseName} (+${workoutLogItem.caloriesBurned} kcal)! 💪`);
    setActiveTab('diary');
  };

  // Clear all data
  const handleClearAllData = () => {
    localStorage.clear();
    setProfile(getProfile());
    setDiary({
      meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      workouts: [],
      waterMl: 0,
      notes: ""
    });
    setCustomFoods([]);
    setWeightHistory([]);
    setFastingState(getFastingState());
    setFavoriteFoods([]);
    setRecentFoods([]);
    setMealTemplates([]);
    showToast('Cleared all local data.');
  };

  // Net Calories Calculation
  const allFoods = [
    ...(diary.meals?.breakfast || []),
    ...(diary.meals?.lunch || []),
    ...(diary.meals?.dinner || []),
    ...(diary.meals?.snacks || [])
  ];
  const caloriesEaten = allFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const caloriesBurned = (diary.workouts || []).reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
  const netCalories = caloriesEaten - caloriesBurned;

  return (
    <div className="app-container">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        netCalories={netCalories}
        targetCalories={profile.targetCalories || 2150}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenDataModal={() => setShowDataModal(true)}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="view-fade" key={activeTab}>
          {activeTab === 'diary' && (
            <DashboardView
              diary={diary}
              profile={profile}
              onUpdateDiary={handleUpdateDiary}
              onOpenAddFood={(mealType) => {
                setTargetMealForAdd(mealType);
                setActiveTab('food');
              }}
              onOpenLogWorkout={() => setQuickWorkoutModal(true)}
              fastingState={fastingState}
              onUpdateFasting={handleUpdateFasting}
              mealTemplates={mealTemplates}
              onSaveMealTemplate={handleSaveMealTemplate}
              onLogTemplate={handleLogTemplate}
            />
          )}

          {activeTab === 'food' && (
            <FoodDatabaseView
              targetMeal={targetMealForAdd}
              customFoods={customFoods}
              onSaveCustomFood={handleSaveCustomFood}
              onAddFoodToDiary={handleAddFoodToDiary}
              favoriteFoods={favoriteFoods}
              recentFoods={recentFoods}
              mealTemplates={mealTemplates}
              onToggleFavorite={handleToggleFavorite}
              onDeleteMealTemplate={handleDeleteMealTemplate}
              onLogTemplate={handleLogTemplate}
            />
          )}

          {activeTab === 'exercise' && (
            <ExerciseDatabaseView
              userWeightKg={profile.weightKg || 75}
              onLogWorkout={handleLogWorkoutToDiary}
            />
          )}

          {activeTab === 'goals' && (
            <BodyPlannerView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              weightHistory={weightHistory}
              onLogWeight={handleLogWeight}
              onOpenOnboarding={() => setShowOnboardingModal(true)}
            />
          )}
        </div>
      </main>

      {/* First-Time Visitor Clinical Onboarding Modal */}
      {showOnboardingModal && (
        <OnboardingModal
          currentProfile={profile}
          onComplete={handleCompleteOnboarding}
          onClose={() => setShowOnboardingModal(false)}
        />
      )}

      {/* Quick Workout Logger Modal from Dashboard */}
      {quickWorkoutModal && (
        <WorkoutLoggerModal
          exercise={{
            id: 'general-training',
            name: 'Gym Workout / Resistance Sets',
            category: 'strength',
            equipment: 'barbell / dumbbell',
            primaryMuscles: ['full body']
          }}
          userWeightKg={profile.weightKg || 75}
          onClose={() => setQuickWorkoutModal(false)}
          onLogWorkout={handleLogWorkoutToDiary}
        />
      )}

      {/* Privacy & Backup Modal */}
      {showDataModal && (
        <DataManagementModal
          onClose={() => setShowDataModal(false)}
          onDataImported={() => {
            setProfile(getProfile());
            setDiary(getDayDiary(currentDate));
            setCustomFoods(getCustomFoods());
            setWeightHistory(getWeightHistory());
            setFastingState(getFastingState());
            setFavoriteFoods(getFavoriteFoods());
            setRecentFoods(getRecentFoods());
            setMealTemplates(getMealTemplates());
            showToast('Backup restored successfully!');
          }}
          onClearAllData={handleClearAllData}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
