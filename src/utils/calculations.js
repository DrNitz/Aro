// Nutrition, Calorie & Fitness Formulas

/**
 * Calculate BMR (Mifflin-St Jeor Equation)
 */
export function calculateBMR(gender, weightKg, heightCm, age) {
  if (!weightKg || !heightCm || !age) return 1800;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'female' ? Math.round(base - 161) : Math.round(base + 5);
}

/**
 * Calculate TDEE based on BMR and Activity Level
 */
export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,       // Little to no exercise
    light: 1.375,         // Light exercise 1-3 days/wk
    moderate: 1.55,       // Moderate exercise 3-5 days/wk
    very_active: 1.725,   // Heavy exercise 6-7 days/wk
    extra_active: 1.9     // Intense daily training / physical job
  };
  const multiplier = multipliers[activityLevel] || 1.375;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate Daily Target Calories & Macros based on Goal
 */
export function calculateTargetMacros(targetCalories, macroPreset = 'balanced', customRatios = null) {
  let pRatio = 0.30;
  let cRatio = 0.40;
  let fRatio = 0.30;

  if (macroPreset === 'high_protein') {
    pRatio = 0.40;
    cRatio = 0.35;
    fRatio = 0.25;
  } else if (macroPreset === 'low_carb') {
    pRatio = 0.30;
    cRatio = 0.20;
    fRatio = 0.50;
  } else if (macroPreset === 'keto') {
    pRatio = 0.20;
    cRatio = 0.05;
    fRatio = 0.75;
  } else if (macroPreset === 'custom' && customRatios) {
    pRatio = customRatios.p;
    cRatio = customRatios.c;
    fRatio = customRatios.f;
  }

  // Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g
  const protein = Math.round((targetCalories * pRatio) / 4);
  const carbs = Math.round((targetCalories * cRatio) / 4);
  const fat = Math.round((targetCalories * fRatio) / 9);
  const fiber = Math.round((targetCalories / 1000) * 14); // Standard guideline: 14g fiber per 1000 kcal

  return {
    calories: targetCalories,
    protein,
    carbs,
    fat,
    fiber
  };
}

/**
 * 1-Rep Max Estimate using Brzycki formula
 */
export function calculateOneRepMax(weightKg, reps) {
  if (!weightKg || !reps || reps < 1) return 0;
  if (reps === 1) return Math.round(weightKg);
  if (reps > 30) return Math.round(weightKg * 1.5); // cap extrapolation
  return Math.round(weightKg / (1.0278 - (0.0278 * reps)));
}

/**
 * BMI Calculation
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let status = "Normal";
  let color = "#10b981";

  if (bmi < 18.5) {
    status = "Underweight";
    color = "#38bdf8";
  } else if (bmi < 25) {
    status = "Healthy / Normal";
    color = "#10b981";
  } else if (bmi < 30) {
    status = "Overweight";
    color = "#f59e0b";
  } else {
    status = "Obese";
    color = "#f43f5e";
  }

  return {
    value: parseFloat(bmi.toFixed(1)),
    status,
    color
  };
}
