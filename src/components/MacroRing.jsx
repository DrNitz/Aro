import React from 'react';
import { Flame, Beef, Wheat, Droplets, Sparkles } from 'lucide-react';

export default function MacroRing({
  caloriesEaten,
  caloriesBurned,
  targetCalories,
  proteinEaten,
  targetProtein,
  carbsEaten,
  targetCarbs,
  fatEaten,
  targetFat,
  fiberEaten,
  targetFiber
}) {
  const netCalories = Math.max(0, caloriesEaten - caloriesBurned);
  const remainingCalories = targetCalories - netCalories;

  // Percentage calculations capped for ring drawing
  const calPercent = Math.min(100, Math.round((netCalories / (targetCalories || 2000)) * 100));
  const proteinPercent = Math.min(100, Math.round((proteinEaten / (targetProtein || 150)) * 100));
  const carbsPercent = Math.min(100, Math.round((carbsEaten / (targetCarbs || 200)) * 100));
  const fatPercent = Math.min(100, Math.round((fatEaten / (targetFat || 65)) * 100));
  const fiberPercent = Math.min(100, Math.round((fiberEaten / (targetFiber || 30)) * 100));

  // Circular SVG ring helpers
  const size = 230;
  const strokeWidth = 14;
  const center = size / 2;

  // Concentric radii
  const rCal = 94;
  const rProtein = 74;
  const rCarbs = 56;
  const rFat = 40;

  const getCircumference = (radius) => 2 * Math.PI * radius;
  const getOffset = (radius, percent) => {
    const c = getCircumference(radius);
    return c - (percent / 100) * c;
  };

  return (
    <div className="macro-hero-card glass-card">
      <div className="macro-hero-grid">
        {/* Left: Concentric Multi-Ring Radial Graphic */}
        <div className="ring-container">
          <svg className="concentric-ring-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <linearGradient id="gradCal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
              <linearGradient id="gradProtein" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="gradCarbs" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="gradFat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>

            {/* Background Tracks */}
            <circle cx={center} cy={center} r={rCal} stroke="rgba(244, 63, 94, 0.15)" strokeWidth={strokeWidth} fill="none" />
            <circle cx={center} cy={center} r={rProtein} stroke="rgba(139, 92, 246, 0.15)" strokeWidth={strokeWidth} fill="none" />
            <circle cx={center} cy={center} r={rCarbs} stroke="rgba(245, 158, 11, 0.15)" strokeWidth={strokeWidth} fill="none" />
            <circle cx={center} cy={center} r={rFat} stroke="rgba(59, 130, 246, 0.15)" strokeWidth={strokeWidth} fill="none" />

            {/* Active Rings with Transitions */}
            <circle
              cx={center}
              cy={center}
              r={rCal}
              stroke="url(#gradCal)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={getCircumference(rCal)}
              strokeDashoffset={getOffset(rCal, calPercent)}
              strokeLinecap="round"
              className="ring-path"
              transform={`rotate(-90 ${center} ${center})`}
            />

            <circle
              cx={center}
              cy={center}
              r={rProtein}
              stroke="url(#gradProtein)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={getCircumference(rProtein)}
              strokeDashoffset={getOffset(rProtein, proteinPercent)}
              strokeLinecap="round"
              className="ring-path"
              transform={`rotate(-90 ${center} ${center})`}
            />

            <circle
              cx={center}
              cy={center}
              r={rCarbs}
              stroke="url(#gradCarbs)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={getCircumference(rCarbs)}
              strokeDashoffset={getOffset(rCarbs, carbsPercent)}
              strokeLinecap="round"
              className="ring-path"
              transform={`rotate(-90 ${center} ${center})`}
            />

            <circle
              cx={center}
              cy={center}
              r={rFat}
              stroke="url(#gradFat)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={getCircumference(rFat)}
              strokeDashoffset={getOffset(rFat, fatPercent)}
              strokeLinecap="round"
              className="ring-path"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </svg>

          {/* Center Text */}
          <div className="ring-center-content">
            <span className="ring-center-val font-display">
              {remainingCalories >= 0 ? remainingCalories.toLocaleString() : Math.abs(remainingCalories).toLocaleString()}
            </span>
            <span className="ring-center-label">
              {remainingCalories >= 0 ? "kcal left" : "kcal over"}
            </span>
          </div>
        </div>

        {/* Right: Detailed Breakdown & Energy Equation */}
        <div className="macro-details-col">
          {/* Energy Equation: Base - Eaten + Burned = Remaining */}
          <div className="energy-equation-bar">
            <div className="equation-item">
              <span className="eq-label">Target Goal</span>
              <span className="eq-val mono">{targetCalories.toLocaleString()}</span>
            </div>
            <span className="eq-sign">-</span>
            <div className="equation-item">
              <span className="eq-label text-coral">Food Logged</span>
              <span className="eq-val mono text-coral">{caloriesEaten.toLocaleString()}</span>
            </div>
            <span className="eq-sign">+</span>
            <div className="equation-item">
              <span className="eq-label text-cyan">Burned (Ex)</span>
              <span className="eq-val mono text-cyan">{caloriesBurned.toLocaleString()}</span>
            </div>
            <span className="eq-sign">=</span>
            <div className="equation-item highlight-eq">
              <span className="eq-label text-primary">Net Calories</span>
              <span className="eq-val mono text-primary">{netCalories.toLocaleString()}</span>
            </div>
          </div>

          {/* Macro Progress Bars Grid */}
          <div className="macro-cards-grid">
            {/* Protein */}
            <div className="macro-card-item">
              <div className="macro-card-top">
                <div className="macro-card-title">
                  <div className="macro-dot dot-protein"></div>
                  <span>Protein</span>
                </div>
                <span className="macro-card-vals mono">
                  <strong>{Math.round(proteinEaten)}g</strong> / {targetProtein}g
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill bar-protein" 
                  style={{ width: `${proteinPercent}%` }}
                ></div>
              </div>
              <span className="macro-remaining-hint">
                {targetProtein - Math.round(proteinEaten) > 0 
                  ? `${targetProtein - Math.round(proteinEaten)}g remaining`
                  : 'Goal reached! 🎉'}
              </span>
            </div>

            {/* Carbs */}
            <div className="macro-card-item">
              <div className="macro-card-top">
                <div className="macro-card-title">
                  <div className="macro-dot dot-carbs"></div>
                  <span>Carbs</span>
                </div>
                <span className="macro-card-vals mono">
                  <strong>{Math.round(carbsEaten)}g</strong> / {targetCarbs}g
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill bar-carbs" 
                  style={{ width: `${carbsPercent}%` }}
                ></div>
              </div>
              <span className="macro-remaining-hint">
                {targetCarbs - Math.round(carbsEaten) > 0 
                  ? `${targetCarbs - Math.round(carbsEaten)}g remaining`
                  : 'Goal reached!'}
              </span>
            </div>

            {/* Fat */}
            <div className="macro-card-item">
              <div className="macro-card-top">
                <div className="macro-card-title">
                  <div className="macro-dot dot-fat"></div>
                  <span>Fat</span>
                </div>
                <span className="macro-card-vals mono">
                  <strong>{Math.round(fatEaten)}g</strong> / {targetFat}g
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill bar-fat" 
                  style={{ width: `${fatPercent}%` }}
                ></div>
              </div>
              <span className="macro-remaining-hint">
                {targetFat - Math.round(fatEaten) > 0 
                  ? `${targetFat - Math.round(fatEaten)}g remaining`
                  : 'Goal reached!'}
              </span>
            </div>

            {/* Fiber */}
            <div className="macro-card-item">
              <div className="macro-card-top">
                <div className="macro-card-title">
                  <div className="macro-dot dot-fiber"></div>
                  <span>Fiber</span>
                </div>
                <span className="macro-card-vals mono">
                  <strong>{Math.round(fiberEaten)}g</strong> / {targetFiber}g
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill bar-fiber" 
                  style={{ width: `${fiberPercent}%` }}
                ></div>
              </div>
              <span className="macro-remaining-hint">
                {targetFiber - Math.round(fiberEaten) > 0 
                  ? `${targetFiber - Math.round(fiberEaten)}g remaining`
                  : 'Goal reached!'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
