// Local storage persistence service for Aro
// 100% private, offline-first client storage

const KEYS = {
  PROFILE: 'aro_user_profile',
  DIARIES: 'aro_diaries',
  CUSTOM_FOODS: 'aro_custom_foods',
  WEIGHT_HISTORY: 'aro_weight_history',
  FASTING: 'aro_fasting',
  THEME: 'aro_theme'
};

export const DEFAULT_PROFILE = {
  name: "Health Champion",
  gender: "male",
  age: 26,
  weightKg: 75.0,
  targetWeightKg: 70.0,
  heightCm: 178,
  activityLevel: "moderate",
  goal: "mild_cut", // -250 kcal
  macroPreset: "high_protein",
  targetCalories: 2150,
  targetProtein: 160,
  targetCarbs: 215,
  targetFat: 65,
  targetFiber: 30,
  targetWaterMl: 3000
};

export const DEFAULT_FASTING = {
  isFasting: false,
  startTime: null,
  targetHours: 16
};

// Helpers
export function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// User Profile
export function getProfile() {
  return loadStorage(KEYS.PROFILE, DEFAULT_PROFILE);
}

export function saveProfile(profile) {
  saveStorage(KEYS.PROFILE, profile);
}

// Diaries
export function getAllDiaries() {
  return loadStorage(KEYS.DIARIES, {});
}

export function getDayDiary(dateStr) {
  const diaries = getAllDiaries();
  return diaries[dateStr] || {
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    },
    workouts: [],
    waterMl: 0,
    notes: ""
  };
}

export function saveDayDiary(dateStr, diary) {
  const diaries = getAllDiaries();
  diaries[dateStr] = diary;
  saveStorage(KEYS.DIARIES, diaries);
}

// Custom Foods
export function getCustomFoods() {
  return loadStorage(KEYS.CUSTOM_FOODS, []);
}

export function saveCustomFoods(foods) {
  saveStorage(KEYS.CUSTOM_FOODS, foods);
}

// Weight History
export function getWeightHistory() {
  return loadStorage(KEYS.WEIGHT_HISTORY, [
    { date: "2026-10-01", weightKg: 76.5 },
    { date: "2026-10-05", weightKg: 76.1 },
    { date: "2026-10-10", weightKg: 75.6 },
    { date: "2026-10-15", weightKg: 75.0 }
  ]);
}

export function logWeight(dateStr, weightKg) {
  const history = getWeightHistory();
  const existingIdx = history.findIndex(h => h.date === dateStr);
  if (existingIdx >= 0) {
    history[existingIdx].weightKg = weightKg;
  } else {
    history.push({ date: dateStr, weightKg });
  }
  history.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveStorage(KEYS.WEIGHT_HISTORY, history);
}

// Fasting
export function getFastingState() {
  return loadStorage(KEYS.FASTING, DEFAULT_FASTING);
}

export function saveFastingState(state) {
  saveStorage(KEYS.FASTING, state);
}

// Theme
export function getStoredTheme() {
  return localStorage.getItem(KEYS.THEME) || 'dark';
}

export function saveStoredTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
}

// Full Backup Export / Import
export function exportAllData() {
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    profile: getProfile(),
    diaries: getAllDiaries(),
    customFoods: getCustomFoods(),
    weightHistory: getWeightHistory(),
    fasting: getFastingState()
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aro_health_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) saveProfile(data.profile);
    if (data.diaries) saveStorage(KEYS.DIARIES, data.diaries);
    if (data.customFoods) saveCustomFoods(data.customFoods);
    if (data.weightHistory) saveStorage(KEYS.WEIGHT_HISTORY, data.weightHistory);
    if (data.fasting) saveFastingState(data.fasting);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
