import React, { useState } from 'react';
import { 
  Target, 
  Flame, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Scale, 
  Check, 
  Sparkles, 
  Plus, 
  Award,
  Heart,
  Stethoscope,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateTargetMacros, 
  calculateBMI 
} from '../utils/calculations';
import confetti from 'canvas-confetti';

export default function BodyPlannerView({
  profile,
  onUpdateProfile,
  weightHistory,
  onLogWeight,
  onOpenOnboarding
}) {
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' (kg, cm) | 'imperial' (lbs, in)
  const [showClinicalScience, setShowClinicalScience] = useState(true);

  const [form, setForm] = useState({
    name: profile.name || 'Health Champion',
    gender: profile.gender || 'male',
    age: profile.age || 26,
    weightKg: profile.weightKg || 75.0,
    targetWeightKg: profile.targetWeightKg || 70.0,
    heightCm: profile.heightCm || 178,
    activityLevel: profile.activityLevel || 'moderate',
    goal: profile.goal || 'mild_cut',
    macroPreset: profile.macroPreset || 'high_protein'
  });

  const [newWeightInput, setNewWeightInput] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().slice(0, 10));

  // Live calculations
  const bmr = calculateBMR(form.gender, Number(form.weightKg), Number(form.heightCm), Number(form.age));
  const tdee = calculateTDEE(bmr, form.activityLevel);

  // Goal calorie adjustment
  let goalAdjustment = 0;
  if (form.goal === 'cut') goalAdjustment = -500;
  else if (form.goal === 'mild_cut') goalAdjustment = -250;
  else if (form.goal === 'lean_bulk') goalAdjustment = 250;
  else if (form.goal === 'bulk') goalAdjustment = 500;

  const targetCalories = Math.max(1200, tdee + goalAdjustment);
  const targetMacros = calculateTargetMacros(targetCalories, form.macroPreset);
  const bmiInfo = calculateBMI(Number(form.weightKg), Number(form.heightCm));

  const handleApplyGoals = (e) => {
    e.preventDefault();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#8b5cf6']
      });
    } catch {
      // ignore
    }

    onUpdateProfile({
      ...profile,
      ...form,
      targetCalories: targetMacros.calories,
      targetProtein: targetMacros.protein,
      targetCarbs: targetMacros.carbs,
      targetFat: targetMacros.fat,
      targetFiber: targetMacros.fiber
    });
  };

  const handleAddWeightLog = (e) => {
    e.preventDefault();
    if (!newWeightInput) return;
    const val = parseFloat(Number(newWeightInput).toFixed(1));
    onLogWeight(newWeightDate, val);
    setNewWeightInput('');
    setForm({ ...form, weightKg: val });
  };

  // SVG Chart points calculation for weight history
  const sortedWeights = [...weightHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartHeight = 160;
  const chartWidth = 520;
  const padding = 35;

  const minWeight = sortedWeights.length > 0 
    ? Math.floor(Math.min(...sortedWeights.map(w => w.weightKg), Number(form.targetWeightKg)) - 1)
    : 65;
  const maxWeight = sortedWeights.length > 0 
    ? Math.ceil(Math.max(...sortedWeights.map(w => w.weightKg), Number(form.targetWeightKg)) + 1)
    : 85;

  const getX = (idx, total) => {
    if (total <= 1) return padding + chartWidth / 2;
    return padding + (idx / (total - 1)) * (chartWidth - padding * 2);
  };

  const getY = (weight) => {
    const range = maxWeight - minWeight || 1;
    return chartHeight - padding - ((weight - minWeight) / range) * (chartHeight - padding * 2);
  };

  const polylinePoints = sortedWeights
    .map((w, idx) => `${getX(idx, sortedWeights.length)},${getY(w.weightKg)}`)
    .join(' ');

  const targetLineY = getY(Number(form.targetWeightKg));

  return (
    <div className="body-planner-view">
      {/* Medical Authority Banner */}
      <div className="medical-authority-banner glass-card">
        <div className="authority-banner-left">
          <div className="medical-icon-circle">
            <Stethoscope size={24} className="text-primary" />
          </div>
          <div>
            <div className="authority-badge-row">
              <span className="badge badge-doctor">Physician-Directed Clinical Nutrition</span>
              <span className="badge badge-cyan">Mifflin-St Jeor Clinical Standard</span>
              <span className="badge badge-purple">FAO / WHO / UNU PAL Standards</span>
            </div>
            <h2 className="authority-heading">Evidence-Based Metabolic Architecture</h2>
            <p className="authority-sub">
              Calorie and macronutrient prescriptions are computed using validated human physiology equations rather than arbitrary guesses.
            </p>
          </div>
        </div>

        <div className="authority-banner-right">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowClinicalScience(!showClinicalScience)}
          >
            <BookOpen size={14} className="text-primary" />
            <span>{showClinicalScience ? 'Hide Scientific Evidence' : 'How We Calculate (Formulas)'}</span>
            {showClinicalScience ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Top Planner Grid */}
      <div className="planner-top-grid grid-2">
        {/* Left: Anthropometric Inputs & TDEE Calculator Form */}
        <div className="glass-card planner-card">
          <div className="card-header">
            <div className="card-title">
              <Target className="text-primary" size={20} />
              <span>Personal Anthropometric Profile</span>
            </div>
            <span className="badge badge-cyan">Mifflin-St Jeor</span>
          </div>

          <form onSubmit={handleApplyGoals} className="card-body planner-form">
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
                <label className="input-label">Current Body Weight (kg)</label>
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
                <label className="input-label">Stature / Height (cm)</label>
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
              <label className="input-label">Target Body Weight Goal (kg)</label>
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

            <div className="input-group">
              <label className="input-label">Physical Activity Level (PAL Coefficient)</label>
              <select
                className="input-field"
                value={form.activityLevel}
                onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
              >
                <option value="sedentary">Sedentary: Desk role, minimal movement (1.20x PAL)</option>
                <option value="light">Lightly Active: Structured workouts 1-3 days/week (1.375x PAL)</option>
                <option value="moderate">Moderately Active: Structured workouts 3-5 days/week (1.55x PAL)</option>
                <option value="very_active">Very Active: Heavy daily training 6-7 days/week (1.725x PAL)</option>
                <option value="extra_active">Extra Active: Hard physical labor / endurance athlete (1.90x PAL)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Clinical Nutritional Objective</label>
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
              <label className="input-label">Macronutrient Partitioning Strategy</label>
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

            <button type="submit" className="btn btn-primary btn-apply-goals">
              <Check size={17} />
              <span>Apply Clinical Targets to Diary ({targetCalories} kcal)</span>
            </button>
          </form>
        </div>

        {/* Right: Calculated Energy Output & Macro Targets */}
        <div className="planner-results-col">
          {/* Energy Breakdown Card */}
          <div className="glass-card result-summary-card">
            <h3 className="result-card-title">Metabolic Energy Partitioning</h3>

            <div className="energy-pillars-row">
              <div className="energy-pillar-box">
                <span className="pillar-metric-label">Basal Metabolic Rate</span>
                <span className="pillar-metric-val mono text-cyan">{bmr}</span>
                <span className="pillar-metric-sub">kcal/day (Cellular Rest)</span>
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
            <h4 className="target-macros-title">Prescribed Daily Macronutrient Distribution</h4>
            <div className="target-macros-row grid-4">
              <div className="target-macro-box">
                <span className="target-macro-name text-coral">Calories</span>
                <span className="target-macro-grams mono">{targetCalories}</span>
                <span className="target-macro-sub">kcal</span>
              </div>

              <div className="target-macro-box">
                <span className="target-macro-name text-protein">Protein</span>
                <span className="target-macro-grams mono">{targetMacros.protein}g</span>
                <span className="target-macro-sub">
                  {(targetMacros.protein / form.weightKg).toFixed(1)} g/kg
                </span>
              </div>

              <div className="target-macro-box">
                <span className="target-macro-name text-carbs">Carbs</span>
                <span className="target-macro-grams mono">{targetMacros.carbs}g</span>
                <span className="target-macro-sub">Glycogen</span>
              </div>

              <div className="target-macro-box">
                <span className="target-macro-name text-fat">Lipids</span>
                <span className="target-macro-grams mono">{targetMacros.fat}g</span>
                <span className="target-macro-sub">Endocrine</span>
              </div>
            </div>
          </div>

          {/* BMI Card */}
          {bmiInfo && (
            <div className="glass-card bmi-summary-card">
              <div className="card-header">
                <div className="card-title">
                  <Scale className="text-cyan" size={18} />
                  <span>Body Mass Index (Quetelet Index)</span>
                </div>
                <span className="badge" style={{ background: bmiInfo.color, color: '#fff' }}>
                  {bmiInfo.status}
                </span>
              </div>

              <div className="card-body bmi-body-row">
                <div className="bmi-number-col">
                  <span className="bmi-large-val mono">{bmiInfo.value}</span>
                  <span className="bmi-sub">kg/m²</span>
                </div>

                <div className="bmi-ranges-bar">
                  <div className="bmi-bar-segment seg-under" title="Underweight < 18.5"></div>
                  <div className="bmi-bar-segment seg-normal" title="Normal 18.5 - 24.9"></div>
                  <div className="bmi-bar-segment seg-over" title="Overweight 25 - 29.9"></div>
                  <div className="bmi-bar-segment seg-obese" title="Obese 30+"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Clinical Science & Calculation Methodology Section */}
      {showClinicalScience && (
        <div className="clinical-methodology-card glass-card">
          <div className="card-header">
            <div className="card-title">
              <Stethoscope className="text-primary" size={20} />
              <span>Clinical Calculation Methodology & Mathematical Transparency</span>
            </div>
            <span className="badge badge-doctor">Peer-Reviewed Literature</span>
          </div>

          <div className="card-body methodology-body">
            <div className="methodology-grid grid-2">
              {/* Formula 1 */}
              <div className="methodology-block">
                <h4 className="methodology-title">1. Basal Metabolic Rate (Mifflin-St Jeor Equation)</h4>
                <div className="formula-box mono">
                  {form.gender === 'male' ? (
                    <>
                      <div>BMR = (10 × W) + (6.25 × H) - (5 × A) + 5</div>
                      <div className="formula-calc-live">
                        = (10 × {form.weightKg}) + (6.25 × {form.heightCm}) - (5 × {form.age}) + 5 = <strong>{bmr} kcal/day</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>BMR = (10 × W) + (6.25 × H) - (5 × A) - 161</div>
                      <div className="formula-calc-live">
                        = (10 × {form.weightKg}) + (6.25 × {form.heightCm}) - (5 × {form.age}) - 161 = <strong>{bmr} kcal/day</strong>
                      </div>
                    </>
                  )}
                </div>
                <p className="methodology-desc">
                  <strong>Clinical Context:</strong> Accounts for 60–75% of total human energy expenditure (cellular respiration, myocardial contraction, renal glomerular filtration, and hepatic synthesis). In systematic reviews conducted by the <em>Academy of Nutrition and Dietetics</em>, the Mifflin-St Jeor equation demonstrated the lowest error margin (within ±10% of indirect calorimetry) compared to the older Harris-Benedict (1919) equation.
                </p>
              </div>

              {/* Formula 2 */}
              <div className="methodology-block">
                <h4 className="methodology-title">2. Total Daily Energy Expenditure (TDEE = BMR × PAL)</h4>
                <div className="formula-box mono">
                  <div>TDEE = BMR × Physical Activity Level (PAL)</div>
                  <div className="formula-calc-live">
                    = {bmr} × {form.activityLevel === 'sedentary' ? '1.20' : form.activityLevel === 'light' ? '1.375' : form.activityLevel === 'moderate' ? '1.55' : form.activityLevel === 'very_active' ? '1.725' : '1.90'} = <strong>{tdee} kcal/day</strong>
                  </div>
                </div>
                <p className="methodology-desc">
                  <strong>Clinical Context:</strong> Derived from joint guidelines by the Food and Agriculture Organization (FAO), World Health Organization (WHO), and United Nations University (UNU). PAL coefficients aggregate spontaneous non-exercise activity thermogenesis (NEAT), planned exercise thermogenesis (EAT), and the thermic effect of food (TEF ~10%).
                </p>
              </div>

              {/* Formula 3 */}
              <div className="methodology-block">
                <h4 className="methodology-title">3. Caloric Deficit / Surplus Mechanics</h4>
                <div className="formula-box mono">
                  <div>Prescribed Target = TDEE + Δ (Goal Factor)</div>
                  <div className="formula-calc-live">
                    = {tdee} + ({goalAdjustment} kcal) = <strong>{targetCalories} kcal/day</strong>
                  </div>
                </div>
                <p className="methodology-desc">
                  <strong>Clinical Context:</strong> Adipose tissue has an energetic density of ~7,700 kcal/kg (~3,500 kcal/lb). A structured deficit of -500 kcal/day mathematically yields ~0.45 kg of fat loss weekly. Prescribing mild deficits (-250 kcal/day) is clinically preferred for athletic populations to preserve myofibrillar protein synthesis, support thyroid conversion ($T_4 \rightarrow T_3$), and minimize neuroendocrine leptin drops.
                </p>
              </div>

              {/* Formula 4 */}
              <div className="methodology-block">
                <h4 className="methodology-title">4. Macronutrient Partitioning Science</h4>
                <div className="formula-box mono">
                  <div>Protein (4 kcal/g) | Carbohydrates (4 kcal/g) | Lipids (9 kcal/g)</div>
                  <div className="formula-calc-live">
                    Protein: <strong>{targetMacros.protein}g</strong> ({(targetMacros.protein / form.weightKg).toFixed(1)} g/kg) • Carbs: <strong>{targetMacros.carbs}g</strong> • Fat: <strong>{targetMacros.fat}g</strong>
                  </div>
                </div>
                <p className="methodology-desc">
                  <strong>Clinical Context:</strong> High-protein targets (1.6 to 2.2 g/kg body weight) sustain positive nitrogen balance and spare skeletal muscle during caloric restriction. Protein has the highest Thermic Effect of Food (TEF ~20–30%), whereas dietary fats are indispensable for fat-soluble vitamin assimilation (A, D, E, K) and sterol hormone synthesis.
                </p>
              </div>
            </div>

            {/* Medical Literature Citations */}
            <div className="citations-box">
              <span className="citations-title">📚 Primary Peer-Reviewed Scientific References:</span>
              <ul className="citations-list">
                <li>
                  <strong>Mifflin MD, St Jeor ST, Hill LA, et al.</strong> <em>A new predictive equation for resting energy expenditure in healthy individuals.</em> Am J Clin Nutr. 1990;51(2):241-247.
                </li>
                <li>
                  <strong>Frankenfield D, Roth-Yousey L, Compher C.</strong> <em>Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults: a systematic review.</em> J Am Diet Assoc. 2005;105(5):775-789.
                </li>
                <li>
                  <strong>Ainsworth BE, et al.</strong> <em>2011 Compendium of Physical Activities: a second update of codes and MET intensities.</em> Med Sci Sports Exerc. 2011;43(8):1575-1581.
                </li>
                <li>
                  <strong>Food and Agriculture Organization (FAO) / WHO / UNU.</strong> <em>Human energy requirements: Report of a Joint FAO/WHO/UNU Expert Consultation.</em> Rome: FAO; 2004.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Weight History & Visual Progress Trend Chart */}
      <div className="glass-card weight-tracker-card">
        <div className="card-header">
          <div className="card-title">
            <TrendingDown className="text-primary" size={20} />
            <span>Anthropometric Progress & Weight Trend</span>
          </div>

          {/* Add Weight Inline Form */}
          <form onSubmit={handleAddWeightLog} className="inline-weight-form">
            <input
              type="date"
              value={newWeightDate}
              onChange={(e) => setNewWeightDate(e.target.value)}
              className="input-field inline-date-input"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Weight (kg)"
              value={newWeightInput}
              onChange={(e) => setNewWeightInput(e.target.value)}
              className="input-field inline-weight-input mono"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Log Weight</span>
            </button>
          </form>
        </div>

        <div className="card-body">
          {sortedWeights.length === 0 ? (
            <p className="text-muted">No weight records yet. Enter your current weight above.</p>
          ) : (
            <div className="chart-wrapper">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="weight-svg-chart"
                preserveAspectRatio="none"
              >
                {/* Horizontal Guide Lines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

                {/* Target Weight Reference Line */}
                <line
                  x1={padding}
                  y1={targetLineY}
                  x2={chartWidth - padding}
                  y2={targetLineY}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <text x={chartWidth - padding - 85} y={targetLineY - 6} fill="#10b981" fontSize="10" className="mono">
                  Goal: {form.targetWeightKg} kg
                </text>

                {/* Weight Trend Line */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />

                {/* Data Points */}
                {sortedWeights.map((w, idx) => {
                  const cx = getX(idx, sortedWeights.length);
                  const cy = getY(w.weightKg);
                  return (
                    <g key={idx}>
                      <circle cx={cx} cy={cy} r="5" fill="#080c14" stroke="#38bdf8" strokeWidth="2.5" />
                      <text x={cx} y={cy - 10} fill="#f8fafc" fontSize="10" textAnchor="middle" className="mono">
                        {w.weightKg}
                      </text>
                      <text x={cx} y={chartHeight - 8} fill="#94a3b8" fontSize="9" textAnchor="middle">
                        {w.date.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
