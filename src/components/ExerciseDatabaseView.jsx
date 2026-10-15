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
  Eye
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
  const [lightboxImage, setLightboxImage] = useState(null);

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
        <div className="exercise-cards-grid grid-2">
          {filteredExercises.slice(0, 50).map((ex) => {
            const isExpanded = expandedExerciseId === ex.id;
            const primaryMuscle = ex.primaryMuscles?.[0] || 'General';
            const hasImages = ex.images && ex.images.length > 0;

            return (
              <div key={ex.id} className="glass-card exercise-card">
                {/* Header with Title, Badges, and Quick Log Button */}
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

                {/* Card Body with Enlarged Image Previews */}
                <div className="exercise-card-body">
                  {/* Enlarged Demonstration Image Strip on the Card */}
                  {hasImages && (
                    <div className="exercise-card-image-preview-strip">
                      {ex.images.slice(0, 2).map((img, i) => (
                        <div 
                          key={i} 
                          className="exercise-image-card"
                          onClick={() => setLightboxImage({
                            url: getExerciseImageUrl(img),
                            title: ex.name,
                            step: i + 1,
                            total: ex.images.length,
                            instructions: ex.instructions
                          })}
                          title="Click to view high-resolution full-screen posture"
                        >
                          <img
                            src={getExerciseImageUrl(img)}
                            alt={`${ex.name} Step ${i + 1}`}
                            className="exercise-demo-photo"
                            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                          />
                          <div className="exercise-image-overlay">
                            <span className="step-badge">
                              Step {i + 1}: {i === 0 ? 'Starting Posture' : 'Peak Contraction'}
                            </span>
                            <span className="zoom-hint-pill">
                              <Maximize2 size={12} />
                              <span>Enlarge</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Primary Instruction Preview */}
                  {ex.instructions && ex.instructions.length > 0 && (
                    <p className="instruction-preview">
                      {ex.instructions[0]}
                    </p>
                  )}

                  {/* Expandable Accordion for full instructions & detailed biomechanics */}
                  {isExpanded && (
                    <div className="exercise-expanded-content">
                      <h4 className="instructions-title">Step-by-Step Biomechanics Guide:</h4>
                      <ol className="instructions-list">
                        {(ex.instructions || []).map((step, idx) => (
                          <li key={idx}>
                            <strong>Step {idx + 1}: </strong>
                            {step}
                          </li>
                        ))}
                      </ol>

                      {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
                        <div className="secondary-muscles-tag">
                          <span>Secondary Supporting Muscles: </span>
                          <strong>{ex.secondaryMuscles.join(', ')}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="exercise-card-bottom-actions">
                    <button 
                      className="btn-expand-instructions"
                      onClick={() => toggleExpand(ex.id)}
                    >
                      <span>{isExpanded ? 'Hide Biomechanics Guide' : 'Full Instructions & Form Guide'}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {hasImages && (
                      <button 
                        className="btn-view-large"
                        onClick={() => setLightboxImage({
                          url: getExerciseImageUrl(ex.images[0]),
                          title: ex.name,
                          step: 1,
                          total: ex.images.length,
                          instructions: ex.instructions
                        })}
                      >
                        <Eye size={14} />
                        <span>Enlarge Photos</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High-Resolution Full-Screen Image Lightbox Modal */}
      {lightboxImage && (
        <div className="modal-overlay lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="lightbox-title-wrap">
                <h3 className="lightbox-title">{lightboxImage.title}</h3>
                <span className="lightbox-step-sub">
                  Demonstration Step {lightboxImage.step} of {lightboxImage.total}
                </span>
              </div>
              <button 
                className="btn-icon btn-secondary" 
                onClick={() => setLightboxImage(null)}
                aria-label="Close enlarged image"
              >
                <X size={20} />
              </button>
            </div>

            <div className="lightbox-image-viewport">
              <img 
                src={lightboxImage.url} 
                alt={lightboxImage.title} 
                className="lightbox-full-img"
              />
            </div>

            {lightboxImage.instructions && lightboxImage.instructions[lightboxImage.step - 1] && (
              <div className="lightbox-caption-box">
                <p>{lightboxImage.instructions[lightboxImage.step - 1]}</p>
              </div>
            )}

            <div className="lightbox-footer">
              <button className="btn btn-secondary" onClick={() => setLightboxImage(null)}>
                Close Preview
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
