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
  Heart
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
  onLogWeight
}) {
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
      {/* Top Planner Grid */}
      <div className="planner-top-grid grid-2">
        {/* Left: TDEE & Nutrition Calculator Form */}
        <div className="glass-card planner-card">
          <div className="card-header">
            <div className="card-title">
              <Target className="text-primary" size={20} />
              <span>TDEE & Calorie Goal Calculator</span>
            </div>
            <span className="badge badge-cyan">Mifflin-St Jeor</span>
          </div>

          <form onSubmit={handleApplyGoals} className="card-body planner-form">
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Gender</label>
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
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
                  className="input-field mono"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Height (cm)</label>
                <input
                  type="number"
                  value={form.heightCm}
                  onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
                  className="input-field mono"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Activity Level</label>
              <select
                className="input-field"
                value={form.activityLevel}
                onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
              >
                <option value="sedentary">Sedentary (Desk job, minimal exercise)</option>
                <option value="light">Lightly Active (1-3 workout days/wk)</option>
                <option value="moderate">Moderately Active (3-5 workout days/wk)</option>
                <option value="very_active">Very Active (6-7 intense training sessions/wk)</option>
                <option value="extra_active">Extra Active (Hard physical labor / athlete)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Primary Goal</label>
              <select
                className="input-field"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              >
                <option value="cut">Fat Loss / Cut (-500 kcal/day)</option>
                <option value="mild_cut">Mild Deficit / Recomp (-250 kcal/day)</option>
                <option value="maintain">Weight Maintenance (TDEE balance)</option>
                <option value="lean_bulk">Lean Muscle Growth (+250 kcal/day)</option>
                <option value="bulk">Hypertrophy Bulk (+500 kcal/day)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Macro Distribution Strategy</label>
              <div className="macro-strategy-chips">
                {[
                  { id: 'high_protein', label: 'High Protein (40P / 35C / 25F)' },
                  { id: 'balanced', label: 'Balanced (30P / 40C / 30F)' },
                  { id: 'low_carb', label: 'Low Carb (30P / 20C / 50F)' },
                  { id: 'keto', label: 'Ketogenic (20P / 5C / 75F)' }
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
              <span>Apply Calculated Targets to Diary</span>
            </button>
          </form>
        </div>

        {/* Right: Calculated Energy Output & Macro Targets */}
        <div className="planner-results-col">
          {/* Energy Breakdown Card */}
          <div className="glass-card result-summary-card">
            <h3 className="result-card-title">Metabolic Energy Output</h3>

            <div className="energy-pillars-row">
              <div className="energy-pillar-box">
                <span className="pillar-metric-label">Basal Metabolic Rate</span>
                <span className="pillar-metric-val mono text-cyan">{bmr}</span>
                <span className="pillar-metric-sub">kcal / day (at complete rest)</span>
              </div>

              <div className="energy-pillar-box">
                <span className="pillar-metric-label">Maintenance (TDEE)</span>
                <span className="pillar-metric-val mono text-purple">{tdee}</span>
                <span className="pillar-metric-sub">kcal / day (with activity)</span>
              </div>

              <div className="energy-pillar-box highlight-pillar">
                <span className="pillar-metric-label">Your Daily Target</span>
                <span className="pillar-metric-val mono text-primary">{targetCalories}</span>
                <span className="pillar-metric-sub">
                  kcal / day ({goalAdjustment >= 0 ? `+${goalAdjustment}` : goalAdjustment})
                </span>
              </div>
            </div>

            {/* Target Macros Breakdown */}
            <h4 className="target-macros-title">Daily Macronutrient Targets</h4>
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
                <span className="target-macro-sub">Energy & Fiber</span>
              </div>

              <div className="target-macro-box">
                <span className="target-macro-name text-fat">Fat</span>
                <span className="target-macro-grams mono">{targetMacros.fat}g</span>
                <span className="target-macro-sub">Hormone balance</span>
              </div>
            </div>
          </div>

          {/* BMI Card */}
          {bmiInfo && (
            <div className="glass-card bmi-summary-card">
              <div className="card-header">
                <div className="card-title">
                  <Scale className="text-cyan" size={18} />
                  <span>Body Mass Index (BMI)</span>
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

      {/* Weight History & Visual Progress Trend Chart */}
      <div className="glass-card weight-tracker-card">
        <div className="card-header">
          <div className="card-title">
            <TrendingDown className="text-primary" size={20} />
            <span>Weight Progress & Trend Chart</span>
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
