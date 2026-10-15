import React, { useState } from 'react';
import { 
  Heart, 
  Target, 
  Activity, 
  Check, 
  Award, 
  HelpCircle, 
  Sparkles, 
  Scale, 
  BookOpen, 
  ChevronRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateTargetMacros, 
  calculateBMI 
} from '../utils/calculations';
import confetti from 'canvas-confetti';

export default function OnboardingModal({
  currentProfile,
  onComplete,
  onClose
}) {
  const [form, setForm] = useState({
    name: currentProfile.name || '',
    gender: currentProfile.gender || 'male',
    age: currentProfile.age || 26,
    weightKg: currentProfile.weightKg || 75.0,
    targetWeightKg: currentProfile.targetWeightKg || 70.0,
    heightCm: currentProfile.heightCm || 178,
    activityLevel: currentProfile.activityLevel || 'moderate',
    goal: currentProfile.goal || 'mild_cut',
    macroPreset: currentProfile.macroPreset || 'high_protein'
  });

  const [showFormulaExplanation, setShowFormulaExplanation] = useState(false);

  // Live Calculations
  const bmr = calculateBMR(form.gender, Number(form.weightKg), Number(form.heightCm), Number(form.age));
  const tdee = calculateTDEE(bmr, form.activityLevel);

  let goalAdjustment = 0;
  if (form.goal === 'cut') goalAdjustment = -500;
  else if (form.goal === 'mild_cut') goalAdjustment = -250;
  else if (form.goal === 'lean_bulk') goalAdjustment = 250;
  else if (form.goal === 'bulk') goalAdjustment = 500;

  const targetCalories = Math.max(1200, tdee + goalAdjustment);
  const targetMacros = calculateTargetMacros(targetCalories, form.macroPreset);
  const bmiInfo = calculateBMI(Number(form.weightKg), Number(form.heightCm));

  const handleConfirm = (e) => {
    e.preventDefault();

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#8b5cf6']
      });
    } catch {
      // ignore
    }

    const updatedProfile = {
      ...currentProfile,
      ...form,
      targetCalories: targetMacros.calories,
      targetProtein: targetMacros.protein,
      targetCarbs: targetMacros.carbs,
      targetFat: targetMacros.fat,
      targetFiber: targetMacros.fiber
    };

    onComplete(updatedProfile);
  };

  return (
    <div className="modal-overlay onboarding-overlay">
      <div className="modal-card onboarding-card" onClick={(e) => e.stopPropagation()}>
        {/* Medical Header */}
        <div className="onboarding-header">
          <div className="doctor-badge-strip">
            <div className="doctor-icon-box">
              <Stethoscope size={24} className="text-primary" />
            </div>
            <div>
              <div className="doctor-title-row">
                <span className="badge badge-doctor">Physician-Led Evidence-Based Health</span>
                <span className="badge badge-cyan">Mifflin-St Jeor Standard</span>
              </div>
              <h2 className="onboarding-main-title">Welcome to Aro Health</h2>
            </div>
          </div>
        </div>

        {/* Doctor Note */}
        <div className="doctor-message-box">
          <p>
            <strong>Doctor's Clinical Note:</strong> Sustainable health begins with accurate human physiology. Instead of arbitrary calorie numbers, Aro computes your biological energy needs using the peer-reviewed <strong>Mifflin-St Jeor predictive equation</strong> and clinical activity coefficients. Let's configure your baseline below.
          </p>
        </div>

        <form onSubmit={handleConfirm} className="onboarding-form-scroll">
          {/* Step 1: Physical Baseline */}
          <div className="onboarding-section">
            <h3 className="onboarding-sec-title">
              <Scale size={18} className="text-cyan" />
              <span>1. Anthropometric Baseline</span>
            </h3>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Biological Sex</label>
                <div className="gender-toggle-row">
                  <button
                    type="button"
                    className={`gender-btn ${form.gender === 'male' ? 'gender-active' : ''}`}
                    onClick={() => setForm({ ...form, gender: 'male' })}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${form.gender === 'female' ? 'gender-active' : ''}`}
                    onClick={() => setForm({ ...form, gender: 'female' })}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Age (years)</label>
                <input
                  type="number"
                  min="14"
                  max="100"
                  required
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                  className="input-field mono"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  required
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
                  className="input-field mono"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  required
                  value={form.heightCm}
                  onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
                  className="input-field mono"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Target Goal Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                required
                value={form.targetWeightKg}
                onChange={(e) => setForm({ ...form, targetWeightKg: Number(e.target.value) })}
                className="input-field mono"
              />
            </div>
          </div>

          {/* Step 2: Activity & Objectives */}
          <div className="onboarding-section">
            <h3 className="onboarding-sec-title">
              <Activity size={18} className="text-purple" />
              <span>2. Daily Physical Activity Level (PAL)</span>
            </h3>

            <div className="input-group">
              <select
                className="input-field"
                value={form.activityLevel}
                onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
              >
                <option value="sedentary">Sedentary: Desk job, minimal structured exercise (1.20x PAL)</option>
                <option value="light">Lightly Active: Light training 1-3 days/week (1.375x PAL)</option>
                <option value="moderate">Moderately Active: Structured workouts 3-5 days/week (1.55x PAL)</option>
                <option value="very_active">Very Active: Heavy daily training 6-7 days/week (1.725x PAL)</option>
                <option value="extra_active">Extra Active: Hard physical labor / endurance athlete (1.90x PAL)</option>
              </select>
            </div>
          </div>

          {/* Step 3: Clinical Health Objective */}
          <div className="onboarding-section">
            <h3 className="onboarding-sec-title">
              <Target size={18} className="text-primary" />
              <span>3. Target Nutritional Objective</span>
            </h3>

            <div className="input-group">
              <select
                className="input-field"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              >
                <option value="mild_cut">Sustainable Fat Loss & Muscle Preservation (-250 kcal/day)</option>
                <option value="cut">Active Fat Loss Deficit (-500 kcal/day, ~0.45kg/wk)</option>
                <option value="maintain">Weight Maintenance & Metabolic Equilibrium (0 kcal adjustment)</option>
                <option value="lean_bulk">Controlled Lean Hypertrophy & Muscle Synthesis (+250 kcal/day)</option>
                <option value="bulk">Athletic Caloric Surplus (+500 kcal/day)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Macronutrient Distribution Prescription</label>
              <div className="macro-strategy-chips">
                {[
                  { id: 'high_protein', label: 'High Protein (40P / 35C / 25F)' },
                  { id: 'balanced', label: 'Balanced (30P / 40C / 30F)' },
                  { id: 'low_carb', label: 'Low Carbohydrate (30P / 20C / 50F)' },
                  { id: 'keto', label: 'Ketogenic Protocol (20P / 5C / 75F)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`strategy-chip ${form.macroPreset === s.id ? 'strategy-chip-active' : ''}`}
                    onClick={() => setForm({ ...form, macroPreset: s.id })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Calculated Clinical Output */}
          <div className="onboarding-results-card glass-card">
            <div className="results-badge-header">
              <span className="results-card-title">Your Clinical Energy Prescription</span>
              {bmiInfo && (
                <span className="badge" style={{ background: bmiInfo.color, color: '#fff' }}>
                  BMI: {bmiInfo.value} ({bmiInfo.status})
                </span>
              )}
            </div>

            <div className="energy-pillars-row">
              <div className="energy-pillar-box">
                <span className="pillar-metric-label">Basal Metabolic Rate</span>
                <span className="pillar-metric-val mono text-cyan">{bmr}</span>
                <span className="pillar-metric-sub">kcal/day (Resting)</span>
              </div>

              <div className="energy-pillar-box">
                <span className="pillar-metric-label">Maintenance (TDEE)</span>
                <span className="pillar-metric-val mono text-purple">{tdee}</span>
                <span className="pillar-metric-sub">kcal/day (Expenditure)</span>
              </div>

              <div className="energy-pillar-box highlight-pillar">
                <span className="pillar-metric-label">Prescribed Intake</span>
                <span className="pillar-metric-val mono text-primary">{targetCalories}</span>
                <span className="pillar-metric-sub">
                  kcal/day ({goalAdjustment >= 0 ? `+${goalAdjustment}` : goalAdjustment})
                </span>
              </div>
            </div>

            {/* Target Macros Breakdown */}
            <div className="target-macros-row grid-4" style={{ marginTop: '14px' }}>
              <div className="target-macro-box">
                <span className="target-macro-name text-coral">Energy</span>
                <span className="target-macro-grams mono">{targetCalories}</span>
                <span className="target-macro-sub">kcal/day</span>
              </div>

              <div className="target-macro-box">
                <span className="target-macro-name text-protein">Protein</span>
                <span className="target-macro-grams mono">{targetMacros.protein}g</span>
                <span className="target-macro-sub">{(targetMacros.protein / form.weightKg).toFixed(1)} g/kg</span>
              </div>

              <div className="target-macro-box">
                <span className="target-macro-name text-carbs">Carbs</span>
                <span className="target-macro-grams mono">{targetMacros.carbs}g</span>
                <span className="target-macro-sub">Glycogen</span>
              </div>

              <div className="target-macro-box">
                <span className="target-macro-name text-fat">Lipids / Fat</span>
                <span className="target-macro-grams mono">{targetMacros.fat}g</span>
                <span className="target-macro-sub">Hormonal</span>
              </div>
            </div>
          </div>

          {/* Toggle Formula Breakdown for Medical Transparency */}
          <div className="formula-toggle-wrap">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
            >
              <BookOpen size={14} className="text-primary" />
              <span>{showFormulaExplanation ? 'Hide Clinical Formula Details' : 'View Clinical Formulas & Evidence'}</span>
            </button>

            {showFormulaExplanation && (
              <div className="formula-medical-breakdown glass-card">
                <h4 className="formula-section-heading">🩺 The Clinical Mathematical Models</h4>
                
                <div className="formula-item-block">
                  <strong>1. Basal Metabolic Rate (Mifflin-St Jeor Equation, 1990)</strong>
                  <p className="formula-math-line mono">
                    {form.gender === 'male' 
                      ? `BMR = (10 × ${form.weightKg}kg) + (6.25 × ${form.heightCm}cm) - (5 × ${form.age}y) + 5 = ${bmr} kcal`
                      : `BMR = (10 × ${form.weightKg}kg) + (6.25 × ${form.heightCm}cm) - (5 × ${form.age}y) - 161 = ${bmr} kcal`
                    }
                  </p>
                  <p className="formula-desc">
                    Recognized by the <em>Academy of Nutrition and Dietetics</em> as the most accurate clinical equation for estimating resting metabolic expenditure in non-critically ill adults.
                  </p>
                </div>

                <div className="formula-item-block">
                  <strong>2. Total Daily Energy Expenditure (TDEE)</strong>
                  <p className="formula-math-line mono">
                    TDEE = BMR ({bmr}) × Activity Coefficient = {tdee} kcal/day
                  </p>
                  <p className="formula-desc">
                    Derived from FAO/WHO/UNU physical activity level (PAL) guidelines to reflect the thermic effect of food (TEF ~10%) and active muscular exertion.
                  </p>
                </div>

                <div className="formula-item-block">
                  <strong>3. Target Energy Prescription</strong>
                  <p className="formula-math-line mono">
                    Target = {tdee} + ({goalAdjustment} kcal) = {targetCalories} kcal/day
                  </p>
                  <p className="formula-desc">
                    Deficits are capped at safe, non-catabolic boundaries (-250 to -500 kcal) to protect thyroid hormone function (T3/T4) and prevent lean myofibrillar loss.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="onboarding-footer">
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              <Check size={18} />
              <span>Confirm & Activate My Health Plan ({targetCalories} kcal)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
