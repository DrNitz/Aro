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
  saveStoredTheme
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
  const handleAddFoodToDiary = (foodLogItem) => {
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
    showToast(`Added ${foodLogItem.name} (${foodLogItem.grams}g) to ${meal.toUpperCase()}! ✨`);
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
  const netCalories = Math.max(0, caloriesEaten - caloriesBurned);

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
          />
        )}

        {activeTab === 'food' && (
          <FoodDatabaseView
            targetMeal={targetMealForAdd}
            customFoods={customFoods}
            onSaveCustomFood={handleSaveCustomFood}
            onAddFoodToDiary={handleAddFoodToDiary}
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
