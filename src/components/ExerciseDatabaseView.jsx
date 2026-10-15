import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Search, 
  Filter, 
  Flame, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Info, 
  Plus, 
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { MET_ACTIVITIES } from '../data/metActivities';
import WorkoutLoggerModal from './WorkoutLoggerModal';

export default function ExerciseDatabaseView({
  userWeightKg = 75,
  onLogWorkout
}) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [selectedExerciseForLogging, setSelectedExerciseForLogging] = useState(null);

  // Load exercises.json from public directory
  useEffect(() => {
    fetch('/data/exercises.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load local exercises.json');
        return res.json();
      })
      .then((data) => {
        setExercises(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Fallback loading exercises:', err);
        // Fallback curated set
        setExercises([
          {
            id: 'barbell-bench-press',
            name: 'Barbell Bench Press - Medium Grip',
            equipment: 'barbell',
            category: 'strength',
            level: 'intermediate',
            primaryMuscles: ['chest'],
            secondaryMuscles: ['shoulders', 'triceps'],
            instructions: [
              'Lie back on a flat bench. Using a medium width grip, lift the bar from the rack.',
              'Lower the bar slowly down to your mid-chest.',
              'Pause, then push the bar back up to the starting position.'
            ]
          },
          {
            id: 'barbell-squat',
            name: 'Barbell Full Squat',
            equipment: 'barbell',
            category: 'strength',
            level: 'intermediate',
            primaryMuscles: ['quadriceps', 'glutes'],
            secondaryMuscles: ['hamstrings', 'calves', 'lower back'],
            instructions: [
              'Rest the barbell securely on the upper trapezius muscles.',
              'Squat down by bending hips and knees until thighs are parallel or below parallel.',
              'Push through your heels back to starting position.'
            ]
          },
          {
            id: 'barbell-deadlift',
            name: 'Barbell Conventional Deadlift',
            equipment: 'barbell',
            category: 'strength',
            level: 'intermediate',
            primaryMuscles: ['lower back', 'glutes', 'hamstrings'],
            secondaryMuscles: ['forearms', 'lats', 'traps'],
            instructions: [
              'Stand with feet hip-width apart under the bar.',
              'Hinge at hips, grip the bar with straight arms.',
              'Drive feet into floor and stand tall, locking hips and knees.'
            ]
          }
        ]);
        setLoading(false);
      });
  }, []);

  // Filter Exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesQuery = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.equipment && ex.equipment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ex.primaryMuscles && ex.primaryMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesQuery) return false;

    if (selectedMuscle !== 'All') {
      const muscleLower = selectedMuscle.toLowerCase();
      const hasMuscle = (ex.primaryMuscles || []).some(m => m.toLowerCase().includes(muscleLower)) ||
        (ex.secondaryMuscles || []).some(m => m.toLowerCase().includes(muscleLower));
      if (!hasMuscle) return false;
    }

    if (selectedEquipment !== 'All') {
      const eqLower = selectedEquipment.toLowerCase();
      if (!ex.equipment || !ex.equipment.toLowerCase().includes(eqLower)) return false;
    }

    if (selectedLevel !== 'All') {
      if (ex.level !== selectedLevel.toLowerCase()) return false;
    }

    return true;
  });

  const muscleFilters = [
    'All',
    'Chest',
    'Lats',
    'Middle Back',
    'Lower Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Quadriceps',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Abdominals'
  ];

  const equipmentFilters = [
    'All',
    'Barbell',
    'Dumbbell',
    'Body only',
    'Cable',
    'Machine',
    'Kettlebells',
    'Bands'
  ];

  const toggleExpand = (id) => {
    setExpandedExerciseId(expandedExerciseId === id ? null : id);
  };

  const getExerciseImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${imagePath}`;
  };

  return (
    <div className="exercise-database-view">
      {/* Top Banner */}
      <div className="exercise-banner glass-card">
        <div className="banner-top-row">
          <div>
            <h2 className="banner-title">Open Exercise & Workout Database</h2>
            <p className="banner-sub">
              Browse over 870+ public domain exercises with muscle targeting, instructions, and workout logging
            </p>
          </div>

          <div className="cardio-quick-pills">
            <span className="cardio-quick-title">Quick Cardio Logging:</span>
            {MET_ACTIVITIES.slice(0, 4).map((act) => (
              <button
                key={act.id}
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedExerciseForLogging({
                  id: act.id,
                  name: act.name,
                  category: 'cardio',
                  met: act.met,
                  isCardioActivity: true
                })}
              >
                <Flame size={13} className="text-coral" />
                <span>{act.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search 870+ exercises (e.g. Bench Press, Squat, Pull-up, Bicep Curl)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="food-search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        {/* Muscle Filter Chips */}
        <div className="filter-group-block">
          <span className="filter-group-label">Target Muscle:</span>
          <div className="category-chips-row">
            {muscleFilters.map((m) => (
              <button
                key={m}
                className={`category-chip ${selectedMuscle === m ? 'category-chip-active' : ''}`}
                onClick={() => setSelectedMuscle(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Filter Chips */}
        <div className="filter-group-block">
          <span className="filter-group-label">Equipment:</span>
          <div className="category-chips-row">
            {equipmentFilters.map((eq) => (
              <button
                key={eq}
                className={`category-chip ${selectedEquipment === eq ? 'category-chip-active' : ''}`}
                onClick={() => setSelectedEquipment(eq)}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="exercise-results-header">
        <span className="results-count mono">
          Showing {filteredExercises.length} of {exercises.length} exercises
        </span>
      </div>

      {loading ? (
        <div className="loading-state-card glass-card">
          <Activity size={32} className="spin text-cyan" />
          <p>Loading open-source exercise library...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="no-foods-card glass-card">
          <Dumbbell size={36} className="text-dim" />
          <p>No exercises found matching your filter criteria.</p>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => { setSelectedMuscle('All'); setSelectedEquipment('All'); setSearchQuery(''); }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="exercise-cards-grid grid-2">
          {filteredExercises.slice(0, 50).map((ex) => {
            const isExpanded = expandedExerciseId === ex.id;
            const primaryMuscle = ex.primaryMuscles?.[0] || 'General';
            const hasImages = ex.images && ex.images.length > 0;

            return (
              <div key={ex.id} className="glass-card exercise-card">
                <div className="exercise-card-header">
                  <div className="exercise-title-meta">
                    <h3 className="exercise-name">{ex.name}</h3>
                    <div className="exercise-badge-row">
                      <span className="badge badge-purple">{primaryMuscle}</span>
                      {ex.equipment && (
                        <span className="badge badge-cyan">{ex.equipment}</span>
                      )}
                      {ex.level && (
                        <span className="badge badge-gray">{ex.level}</span>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedExerciseForLogging(ex)}
                  >
                    <Plus size={14} />
                    <span>Log Sets</span>
                  </button>
                </div>

                {/* Primary Muscle & Instruction Preview */}
                <div className="exercise-card-body">
                  {ex.instructions && ex.instructions.length > 0 && (
                    <p className="instruction-preview">
                      {ex.instructions[0]}
                    </p>
                  )}

                  {/* Expandable Accordion for full instructions and demo photos */}
                  {isExpanded && (
                    <div className="exercise-expanded-content">
                      {hasImages && (
                        <div className="exercise-demo-images">
                          {ex.images.map((img, i) => (
                            <img
                              key={i}
                              src={getExerciseImageUrl(img)}
                              alt={`${ex.name} step ${i + 1}`}
                              className="exercise-demo-photo"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ))}
                        </div>
                      )}

                      <h4 className="instructions-title">Step-by-Step Instructions:</h4>
                      <ol className="instructions-list">
                        {(ex.instructions || []).map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>

                      {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
                        <div className="secondary-muscles-tag">
                          <span>Secondary Muscles: </span>
                          <strong>{ex.secondaryMuscles.join(', ')}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    className="btn-expand-instructions"
                    onClick={() => toggleExpand(ex.id)}
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Instructions & Guide'}</span>
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Workout Logger Modal */}
      {selectedExerciseForLogging && (
        <WorkoutLoggerModal
          exercise={selectedExerciseForLogging}
          userWeightKg={userWeightKg}
          onClose={() => setSelectedExerciseForLogging(null)}
          onLogWorkout={onLogWorkout}
        />
      )}
    </div>
  );
}
