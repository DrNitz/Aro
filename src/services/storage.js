// Local storage persistence service for Aro
// 100% private, offline-first client storage

const KEYS = {
  PROFILE: 'aro_user_profile',
  DIARIES: 'aro_diaries',
  CUSTOM_FOODS: 'aro_custom_foods',
  WEIGHT_HISTORY: 'aro_weight_history',
  FASTING: 'aro_fasting',
  THEME: 'aro_theme',
  FAVORITES: 'aro_food_favorites',
  RECENTS: 'aro_recent_foods',
  TEMPLATES: 'aro_meal_templates'
};

// How many recently-logged foods to remember
const MAX_RECENTS = 24;

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

// ---------------------------------------------------------------------------
// Food Collections: Favorites, Recents & Meal Templates
// ---------------------------------------------------------------------------

/**
 * Builds a compact, serializable snapshot of a food so it can be re-logged
 * later without re-fetching it from Open Food Facts or the curated catalog.
 */
export function toFoodSnapshot(food) {
  if (!food) return null;
  return {
    id: food.id,
    code: food.code || '',
    name: food.name,
    brand: food.brand || '',
    category: food.category || 'Custom',
    calories: food.calories || 0,
    protein: food.protein || 0,
    carbs: food.carbs || 0,
    fat: food.fat || 0,
    saturatedFat: food.saturatedFat || 0,
    fiber: food.fiber || 0,
    sugar: food.sugar || 0,
    sodium: food.sodium || 0,
    potassium: food.potassium || 0,
    calcium: food.calcium || 0,
    magnesium: food.magnesium || 0,
    servingSize: food.servingSize || 100,
    servingUnit: food.servingUnit || 'g',
    commonServing: food.commonServing || { name: '1 Serving', grams: 100 },
    nutriscore: food.nutriscore || null,
    nova: food.nova || null,
    image: food.image || null,
    isCustom: !!food.isCustom
  };
}

// --- Favorites ------------------------------------------------------------
export function getFavoriteFoods() {
  return loadStorage(KEYS.FAVORITES, []);
}

export function saveFavoriteFoods(foods) {
  saveStorage(KEYS.FAVORITES, foods);
}

export function isFavoriteFood(foodId) {
  return getFavoriteFoods().some((f) => f.id === foodId);
}

/** Adds or removes a food from favorites. Returns the updated list. */
export function toggleFavoriteFood(food) {
  const list = getFavoriteFoods();
  const exists = list.some((f) => f.id === food.id);
  const updated = exists
    ? list.filter((f) => f.id !== food.id)
    : [toFoodSnapshot(food), ...list];
  saveFavoriteFoods(updated);
  return updated;
}

// --- Recents --------------------------------------------------------------
export function getRecentFoods() {
  return loadStorage(KEYS.RECENTS, []);
}

export function saveRecentFoods(entries) {
  saveStorage(KEYS.RECENTS, entries);
}

/** Records a food as recently used (most recent first, de-duplicated). */
export function addRecentFood(food) {
  if (!food || !food.id) return getRecentFoods();
  const snapshot = toFoodSnapshot(food);
  const list = getRecentFoods().filter((r) => r.food && r.food.id !== food.id);
  const updated = [{ food: snapshot, at: Date.now() }, ...list].slice(0, MAX_RECENTS);
  saveRecentFoods(updated);
  return updated;
}

// --- Meal Templates -------------------------------------------------------
export function getMealTemplates() {
  return loadStorage(KEYS.TEMPLATES, []);
}

export function saveMealTemplates(templates) {
  saveStorage(KEYS.TEMPLATES, templates);
}

/**
 * Saves a set of diary food-log items as a reusable meal template.
 * @param {string} name Template label
 * @param {string} mealType Original meal key (breakfast/lunch/dinner/snacks)
 * @param {Array} items Food-log items (with computed macros)
 * @returns {Array} Updated template list
 */
export function createMealTemplate(name, mealType, items) {
  const cleanItems = (items || []).map((item) => ({ ...item }));
  const template = {
    id: `tpl-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    name: (name || 'My Meal').trim(),
    mealType: mealType || 'breakfast',
    createdAt: Date.now(),
    items: cleanItems
  };
  const updated = [template, ...getMealTemplates()];
  saveMealTemplates(updated);
  return { template, templates: updated };
}

export function deleteMealTemplate(templateId) {
  const updated = getMealTemplates().filter((t) => t.id !== templateId);
  saveMealTemplates(updated);
  return updated;
}

/** Computes calorie/macro totals for a meal template. */
export function getTemplateTotals(template) {
  const items = template?.items || [];
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
      count: acc.count + 1
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
  );
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
    fasting: getFastingState(),
    favorites: getFavoriteFoods(),
    recents: getRecentFoods(),
    mealTemplates: getMealTemplates()
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
    if (data.favorites) saveFavoriteFoods(data.favorites);
    if (data.recents) saveRecentFoods(data.recents);
    if (data.mealTemplates) saveMealTemplates(data.mealTemplates);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
