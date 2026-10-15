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
  Zap,
  Maximize2,
  X,
  Eye,
  BookOpen
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
  const [selectedExerciseForLogging, setSelectedExerciseForLogging] = useState(null);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState(null);

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
            ],
            images: ['Barbell_Bench_Press_-_Medium_Grip/0.jpg', 'Barbell_Bench_Press_-_Medium_Grip/1.jpg']
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
            ],
            images: ['Barbell_Full_Squat/0.jpg', 'Barbell_Full_Squat/1.jpg']
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
              Browse over 870+ public domain exercises with high-resolution visual posture guides, muscle targeting, and set logging
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

      {/* Exercises Grid Header */}
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
        <div className="exercise-cards-grid">
          {filteredExercises.slice(0, 60).map((ex) => {
            const primaryMuscle = ex.primaryMuscles?.[0] || 'General';
            const hasImages = ex.images && ex.images.length > 0;
            const thumbUrl = hasImages ? getExerciseImageUrl(ex.images[0]) : null;

            return (
              <div 
                key={ex.id} 
                className="glass-card exercise-card"
                onClick={() => setSelectedExerciseDetail(ex)}
                title="Click to view both expanded demonstration postures & biomechanics"
              >
                {/* Small Thumbnail */}
                <div className="exercise-thumb-wrap">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={ex.name}
                      className="exercise-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.parentElement) {
                          e.target.parentElement.classList.add('has-no-thumb');
                        }
                      }}
                    />
                  ) : (
                    <Dumbbell size={24} className="exercise-thumb-placeholder" />
                  )}
                </div>

                {/* Exercise Meta Content */}
                <div className="exercise-card-content">
                  <div className="exercise-name-row">
                    <h3 className="exercise-name">{ex.name}</h3>
                  </div>

                  <div className="exercise-badge-row">
                    <span className="badge badge-purple">{primaryMuscle}</span>
                    {ex.equipment && (
                      <span className="badge badge-cyan">{ex.equipment}</span>
                    )}
                    {ex.level && (
                      <span className="badge badge-gray">{ex.level}</span>
                    )}
                  </div>

                  {ex.instructions && ex.instructions.length > 0 && (
                    <p className="instruction-preview-compact">
                      {ex.instructions[0]}
                    </p>
                  )}

                  <div className="exercise-card-actions-compact">
                    <button 
                      type="button"
                      className="btn-open-detail"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExerciseDetail(ex);
                      }}
                    >
                      <Eye size={13} />
                      <span>Expand Form & Guide</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExerciseForLogging(ex);
                      }}
                      title="Log sets into diary"
                    >
                      <Plus size={13} />
                      <span>Log Sets</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cool Glassy Popup: Dual Expanded Images + Instructions Downside */}
      {selectedExerciseDetail && (
        <div 
          className="glassy-popup-overlay" 
          onClick={() => setSelectedExerciseDetail(null)}
        >
          <div 
            className="glassy-popup-card" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="glassy-popup-header">
              <div className="glassy-popup-title-group">
                <h3 className="glassy-popup-title">{selectedExerciseDetail.name}</h3>
                <div className="exercise-badge-row">
                  <span className="badge badge-purple">
                    {selectedExerciseDetail.primaryMuscles?.[0] || 'General'}
                  </span>
                  {selectedExerciseDetail.equipment && (
                    <span className="badge badge-cyan">{selectedExerciseDetail.equipment}</span>
                  )}
                  {selectedExerciseDetail.level && (
                    <span className="badge badge-gray">{selectedExerciseDetail.level}</span>
                  )}
                  {selectedExerciseDetail.category && (
                    <span className="badge badge-primary">{selectedExerciseDetail.category}</span>
                  )}
                </div>
              </div>

              <button 
                type="button"
                className="btn-icon btn-secondary" 
                onClick={() => setSelectedExerciseDetail(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="glassy-popup-scroll">
              {/* Both Images Expanded Side-by-Side (NO Step 1 / Step 2 green badges) */}
              {selectedExerciseDetail.images && selectedExerciseDetail.images.length > 0 && (
                <div className="glassy-dual-images-grid">
                  {selectedExerciseDetail.images.slice(0, 2).map((img, i) => (
                    <div key={i} className="glassy-image-stage">
                      <img 
                        src={getExerciseImageUrl(img)} 
                        alt={`${selectedExerciseDetail.name} Posture ${i + 1}`} 
                        className="glassy-expanded-img"
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Instructions Downside */}
              <div className="glassy-instructions-downside">
                <div className="glassy-instructions-header">
                  <BookOpen size={17} className="text-primary" />
                  <span>Step-by-Step Biomechanics & Form Execution</span>
                </div>

                <div className="glassy-steps-list">
                  {selectedExerciseDetail.instructions && selectedExerciseDetail.instructions.length > 0 ? (
                    selectedExerciseDetail.instructions.map((step, idx) => (
                      <div key={idx} className="glassy-step-item">
                        <span className="glassy-step-num">{idx + 1}</span>
                        <div className="glassy-step-text">{step}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted" style={{ fontSize: '0.86rem' }}>
                      Follow standard movement mechanics for {selectedExerciseDetail.name}. Maintain controlled cadence, neutral spine, and full range of motion.
                    </p>
                  )}
                </div>

                {/* Secondary Muscles */}
                {selectedExerciseDetail.secondaryMuscles && selectedExerciseDetail.secondaryMuscles.length > 0 && (
                  <div className="glassy-secondary-muscles">
                    <span>Secondary Supporting Muscles:</span>
                    {selectedExerciseDetail.secondaryMuscles.map((muscle) => (
                      <span key={muscle} className="badge badge-secondary">
                        {muscle}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="glassy-popup-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setSelectedExerciseDetail(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  const ex = selectedExerciseDetail;
                  setSelectedExerciseDetail(null);
                  setSelectedExerciseForLogging(ex);
                }}
              >
                <Plus size={16} />
                <span>Log Sets for This Workout</span>
              </button>
            </div>
          </div>
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
