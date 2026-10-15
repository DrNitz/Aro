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
  Stethoscope,
  X,
  Info
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

  // Calculate percentage along spectrum for needle pointer (15 to 35 BMI range)
  const bmiPercent = bmiInfo 
    ? Math.min(96, Math.max(4, ((bmiInfo.value - 15) / (35 - 15)) * 100))
    : 50;

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
    <div className="modal-overlay onboarding-overlay" onClick={onClose}>
      <div 
        className="modal-card onboarding-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-dialog-title"
      >
        {/* Senior UI Header with Mascot & Close Button */}
        <div className="onboarding-header">
          <div className="onboarding-header-left">
            <div className="doctor-avatar-wrap">
              <img 
                src="/images/dr_aro_mascot.jpg" 
                alt="Dr. Aro Mascot" 
                className="doctor-avatar-img"
              />
              <span className="doctor-avatar-pulse"></span>
            </div>
            <div className="onboarding-header-meta">
              <div className="doctor-title-row">
                <span className="badge badge-doctor">Physician-Led Evidence-Based Health</span>
                <span className="badge badge-cyan">Mifflin-St Jeor Standard</span>
              </div>
              <h2 id="onboarding-dialog-title" className="onboarding-main-title">
                Welcome to Aro Health
              </h2>
            </div>
          </div>

          {/* Close Button for easy dismissal */}
          <button 
            type="button" 
            className="btn-icon btn-secondary btn-close-modal" 
            onClick={onClose}
            title="Close / Skip for now"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mascot Hero Welcome Card */}
        <div className="mascot-welcome-banner glass-card">
          <div className="mascot-banner-thumb">
            <img 
              src="/images/dr_aro_mascot.jpg" 
              alt="Dr. Aro - Your Health Companion" 
              className="mascot-hero-avatar"
            />
          </div>
          <div className="mascot-banner-speech">
            <div className="mascot-name-tag">
              <Sparkles size={13} className="text-primary" />
              <span>Aro — 3D Clinical Bio-Companion</span>
            </div>
            <p className="mascot-speech-quote">
              <strong>"Hello! I'm Aro, your personal clinical companion."</strong> Rather than guesswork, we calculate your biological energy expenditure using the peer-reviewed <strong>Mifflin-St Jeor equation</strong>. Calibrate your baseline below.
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleConfirm} className="onboarding-form-scroll">
          {/* Step 1: Anthropometric Baseline */}
          <div className="onboarding-section">
            <div className="onboarding-sec-header">
              <div className="sec-step-pill">1</div>
              <h3 className="onboarding-sec-title">Anthropometric Baseline</h3>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Biological Sex</label>
                <div className="gender-toggle-row">
                  <button
                    type="button"
                    className={`gender-btn ${form.gender === 'male' ? 'gender-active' : ''}`}
                    onClick={() => setForm({ ...form, gender: 'male' })}
                  >
                    <span>♂ Male</span>
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${form.gender === 'female' ? 'gender-active' : ''}`}
                    onClick={() => setForm({ ...form, gender: 'female' })}
                  >
                    <span>♀ Female</span>
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Age</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="14"
                    max="100"
                    required
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                    className="input-field mono"
                  />
                  <span className="input-unit-badge">years</span>
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Current Weight</label>
                <div className="input-with-unit">
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
                  <span className="input-unit-badge">kg</span>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Height</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="100"
                    max="250"
                    required
                    value={form.heightCm}
                    onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
                    className="input-field mono"
                  />
                  <span className="input-unit-badge">cm</span>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Target Goal Weight</label>
              <div className="input-with-unit">
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
                <span className="input-unit-badge">kg</span>
              </div>
            </div>
          </div>

          {/* Step 2: Activity Level */}
          <div className="onboarding-section">
            <div className="onboarding-sec-header">
              <div className="sec-step-pill">2</div>
              <h3 className="onboarding-sec-title">Daily Physical Activity Level (PAL)</h3>
            </div>

            <div className="input-group">
              <select
                className="input-field select-field-styled"
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

          {/* Step 3: Nutritional Objective & Macro Strategy */}
          <div className="onboarding-section">
            <div className="onboarding-sec-header">
              <div className="sec-step-pill">3</div>
              <h3 className="onboarding-sec-title">Clinical Nutritional Objective</h3>
            </div>

            <div className="input-group">
              <select
                className="input-field select-field-styled"
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

          {/* Senior UI Clinical Results & Prescription */}
          <div className="onboarding-results-card glass-card">
            <div className="results-header-row">
              <div className="results-title-group">
                <Activity size={18} className="text-primary" />
                <h4 className="results-card-title">Calculated Energy Prescription</h4>
              </div>
              <span className="badge badge-doctor">Physiological Target</span>
            </div>

            {/* 3 Energy Pillars */}
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
            <div className="target-macros-row grid-4">
              <div className="target-macro-box">
                <span className="target-macro-name text-coral">Daily Energy</span>
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
                <span className="target-macro-sub">Energy & glycogen</span>
              </div>

              <div className="target-macro-box">
                <span className="target-macro-name text-fat">Lipids / Fat</span>
                <span className="target-macro-grams mono">{targetMacros.fat}g</span>
                <span className="target-macro-sub">Hormonal health</span>
              </div>
            </div>

            {/* Senior UI Clinical BMI Spectrum Meter (Replaces the odd yellow pill!) */}
            {bmiInfo && (
              <div className="clinical-bmi-meter-card">
                <div className="bmi-meter-top">
                  <div className="bmi-meter-title-wrap">
                    <span className="bmi-meter-label">Body Mass Index (BMI)</span>
                    <span className="bmi-meter-subtitle">WHO Anthropometric Reference</span>
                  </div>
                  <div className="bmi-meter-value-wrap">
                    <span className="bmi-number mono">{bmiInfo.value}</span>
                    <span className="bmi-unit">kg/m²</span>
                    <span className={`bmi-status-chip bmi-status-${(bmiInfo.status || '').toLowerCase().replace(/[^a-z]/g, '')}`}>
                      {bmiInfo.status}
                    </span>
                  </div>
                </div>

                {/* Segmented Gradient Spectrum Bar */}
                <div className="bmi-spectrum-track">
                  <div className="bmi-segment seg-underweight" title="Underweight (< 18.5)"></div>
                  <div className="bmi-segment seg-normal" title="Normal / Healthy (18.5 - 24.9)"></div>
                  <div className="bmi-segment seg-overweight" title="Pre-obesity / Overweight (25 - 29.9)"></div>
                  <div className="bmi-segment seg-obese" title="Obesity (≥ 30)"></div>
                  
                  {/* Live Animated Needle Marker */}
                  <div 
                    className="bmi-needle-indicator" 
                    style={{ left: `${bmiPercent}%` }}
                  >
                    <div className="bmi-needle-pin"></div>
                    <span className="bmi-needle-tag mono">{bmiInfo.value}</span>
                  </div>
                </div>

                {/* Spectrum Scale Labels */}
                <div className="bmi-scale-labels">
                  <span>&lt; 18.5 (Under)</span>
                  <span>18.5–24.9 (Healthy)</span>
                  <span>25–29.9 (Overweight)</span>
                  <span>≥ 30 (Obese)</span>
                </div>

                <p className="bmi-clinical-footnote">
                  <ShieldCheck size={13} className="text-primary" />
                  <span>
                    <strong>Clinical Note:</strong> BMI is a standard height-to-weight ratio. In active individuals with higher muscularity, elevated BMI reflects healthy lean mass rather than adiposity.
                  </span>
                </p>
              </div>
            )}
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

          {/* Modal Footer with Dismiss & Confirm Actions */}
          <div className="onboarding-footer">
            <button 
              type="button" 
              className="btn btn-secondary btn-skip-onboarding" 
              onClick={onClose}
            >
              Skip for now & Explore Aro
            </button>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg btn-confirm-onboarding"
            >
              <Check size={18} />
              <span>Confirm & Activate Baseline ({targetCalories} kcal)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
