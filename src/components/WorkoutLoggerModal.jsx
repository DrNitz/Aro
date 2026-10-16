import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Flame } from 'lucide-react';
import { calculateOneRepMax } from '../utils/calculations';
import { calculateCaloriesBurned, MET_ACTIVITIES } from '../data/metActivities';
import confetti from 'canvas-confetti';
import { useEscapeKey } from '../hooks/useEscapeKey';

export default function WorkoutLoggerModal({
  exercise,
  userWeightKg = 75,
  onClose,
  onLogWorkout
}) {
  const isCardio = exercise?.category === 'cardio' || exercise?.isCardioActivity;

  useEscapeKey(onClose);

  // Strength Sets State
  const [sets, setSets] = useState([
    { setNum: 1, weight: 60, reps: 10 },
    { setNum: 2, weight: 65, reps: 8 },
    { setNum: 3, weight: 70, reps: 6 }
  ]);

  // Cardio State
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [cardioMet, setCardioMet] = useState(
    exercise?.met || (isCardio ? 8.0 : 4.0)
  );

  if (!exercise) return null;

  // Set Calculations
  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1] || { weight: 50, reps: 10 };
    setSets([
      ...sets,
      {
        setNum: sets.length + 1,
        weight: lastSet.weight,
        reps: lastSet.reps
      }
    ]);
  };

  const handleRemoveSet = (index) => {
    if (sets.length <= 1) return;
    const updated = sets.filter((_, i) => i !== index).map((s, idx) => ({ ...s, setNum: idx + 1 }));
    setSets(updated);
  };

  const handleSetChange = (index, field, value) => {
    const updated = [...sets];
    updated[index][field] = Math.max(0, Number(value) || 0);
    setSets(updated);
  };

  // 1RM Calculation & Volume
  let maxOneRepMax = 0;
  let totalVolumeKg = 0;

  sets.forEach((s) => {
    totalVolumeKg += (s.weight * s.reps);
    const est1rm = calculateOneRepMax(s.weight, s.reps);
    if (est1rm > maxOneRepMax) maxOneRepMax = est1rm;
  });

  // Estimated calories burned for resistance training: ~0.08 kcal per kg volume + base metabolic cost
  const estimatedStrengthCalories = Math.round(Math.max(45, (totalVolumeKg * 0.065) + (sets.length * 15)));

  // Estimated cardio calories
  const estimatedCardioCalories = calculateCaloriesBurned(cardioMet, userWeightKg, durationMinutes);

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#f43f5e']
      });
    } catch {
      // ignore
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isCardio) {
      onLogWorkout({
        id: `workout-${Date.now()}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        category: 'cardio',
        type: 'cardio',
        durationMinutes: Number(durationMinutes),
        met: cardioMet,
        caloriesBurned: estimatedCardioCalories,
        time: timeStr
      });
    } else {
      onLogWorkout({
        id: `workout-${Date.now()}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        category: 'strength',
        type: 'strength',
        muscle: exercise.primaryMuscles?.[0] || 'strength',
        equipment: exercise.equipment || 'gym',
        sets: sets.map(s => ({ weight: s.weight, reps: s.reps })),
        estimatedOneRepMax: maxOneRepMax,
        totalVolumeKg,
        caloriesBurned: estimatedStrengthCalories,
        time: timeStr
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card workout-logger-modal" role="dialog" aria-modal="true" aria-label={`Log workout: ${exercise?.name || 'workout'}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 className="modal-product-title">{exercise.name}</h3>
            <span className="modal-product-brand">
              {isCardio ? 'Cardio & Activity' : `${exercise.equipment || 'Equipment'} • ${(exercise.primaryMuscles || []).join(', ')}`}
            </span>
          </div>
          <button className="btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Exercise Form Visual Guide */}
            {exercise.images && exercise.images.length > 0 && (
              <div className="workout-logger-image-preview">
                {exercise.images.slice(0, 2).map((img, i) => (
                  <div key={i} className="logger-image-card">
                    <img
                      src={`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`}
                      alt={`${exercise.name} ${i + 1}`}
                      className="logger-demo-img"
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
            )}

            {isCardio ? (
              /* Cardio Logger Form */
              <div className="cardio-logger-form">
                <div className="metric-pill-hero">
                  <Flame size={24} className="text-coral" />
                  <div className="metric-hero-text">
                    <span className="metric-hero-val mono">{estimatedCardioCalories} kcal</span>
                    <span className="metric-hero-sub">Estimated energy burned</span>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Duration (Minutes)</label>
                  <div className="duration-slider-row">
                    <input
                      type="range"
                      min="5"
                      max="180"
                      step="5"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="range-slider"
                    />
                    <span className="slider-val-box mono">{durationMinutes} min</span>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Intensity / MET Activity Equivalent</label>
                  <select
                    className="input-field"
                    value={cardioMet}
                    onChange={(e) => setCardioMet(Number(e.target.value))}
                  >
                    {MET_ACTIVITIES.map((act) => (
                      <option key={act.id} value={act.met}>
                        {act.name} (MET {act.met})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* Strength Sets Table */
              <div className="strength-sets-table-wrap">
                {/* Stats Summary Pills */}
                <div className="workout-summary-pills">
                  <div className="summary-stat-pill">
                    <span className="stat-pill-label">Total Volume</span>
                    <span className="stat-pill-val mono text-cyan">{totalVolumeKg.toLocaleString()} kg</span>
                  </div>

                  <div className="summary-stat-pill">
                    <span className="stat-pill-label">Estimated 1RM</span>
                    <span className="stat-pill-val mono text-purple">{maxOneRepMax} kg</span>
                  </div>

                  <div className="summary-stat-pill">
                    <span className="stat-pill-label">Calories Burned</span>
                    <span className="stat-pill-val mono text-coral">~{estimatedStrengthCalories} kcal</span>
                  </div>
                </div>

                {/* Sets Header */}
                <div className="sets-table-header">
                  <span className="col-set">Set</span>
                  <span className="col-weight">Weight (kg)</span>
                  <span className="col-reps">Reps</span>
                  <span className="col-1rm">Est 1RM</span>
                  <span className="col-action"></span>
                </div>

                {/* Sets Rows */}
                <div className="sets-rows-container">
                  {sets.map((set, idx) => {
                    const est = calculateOneRepMax(set.weight, set.reps);
                    return (
                      <div key={idx} className="set-row-item">
                        <span className="set-num-badge mono">{set.setNum}</span>

                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={set.weight}
                          onChange={(e) => handleSetChange(idx, 'weight', e.target.value)}
                          className="input-field set-input mono"
                        />

                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={set.reps}
                          onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                          className="input-field set-input mono"
                        />

                        <span className="set-est-1rm mono text-muted">{est} kg</span>

                        <button
                          type="button"
                          className="btn-delete-item"
                          onClick={() => handleRemoveSet(idx)}
                          disabled={sets.length <= 1}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm add-set-btn"
                  onClick={handleAddSet}
                >
                  <Plus size={15} />
                  <span>Add Another Set</span>
                </button>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>
                Log to Workout (+{isCardio ? estimatedCardioCalories : estimatedStrengthCalories} kcal)
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
