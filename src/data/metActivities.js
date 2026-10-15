// Compendium of Physical Activities MET database
// Calorie burn formula: Calories = MET * weight_kg * (duration_minutes / 60)

export const MET_ACTIVITIES = [
  { id: "running-6mph", name: "Running (6 mph / 10 km/h, ~10 min/mile)", category: "Running", met: 9.8, icon: "Flame" },
  { id: "running-7mph", name: "Running (7 mph / 11.3 km/h, fast pace)", category: "Running", met: 11.0, icon: "Flame" },
  { id: "running-5mph", name: "Jogging (5 mph / 8 km/h, casual jog)", category: "Running", met: 8.3, icon: "Flame" },
  { id: "walking-brisk", name: "Walking (Brisk, 3.5 - 4.0 mph)", category: "Walking", met: 4.3, icon: "Footprints" },
  { id: "walking-casual", name: "Walking (Casual / Dog walk, 2.8 - 3.2 mph)", category: "Walking", met: 3.3, icon: "Footprints" },
  { id: "cycling-moderate", name: "Cycling (Outdoor, Moderate 12-14 mph)", category: "Cycling", met: 8.0, icon: "Bike" },
  { id: "cycling-vigorous", name: "Cycling (Racing / Vigorous >16 mph)", category: "Cycling", met: 10.0, icon: "Bike" },
  { id: "cycling-stationary", name: "Stationary Bike / Spin Class", category: "Cycling", met: 7.0, icon: "Bike" },
  { id: "swimming-moderate", name: "Swimming (Freestyle, Moderate laps)", category: "Swimming", met: 7.0, icon: "Waves" },
  { id: "swimming-vigorous", name: "Swimming (Vigorous / Butterfly)", category: "Swimming", met: 9.8, icon: "Waves" },
  { id: "weight-training-vigorous", name: "Weight Lifting (Vigorous gym workout / bodybuilding)", category: "Gym & Strength", met: 6.0, icon: "Dumbbell" },
  { id: "weight-training-moderate", name: "Weight Lifting (Standard resistance sets & rest)", category: "Gym & Strength", met: 3.8, icon: "Dumbbell" },
  { id: "hiit-circuit", name: "HIIT / Crossfit / Circuit Training", category: "Conditioning", met: 8.5, icon: "Zap" },
  { id: "jump-rope", name: "Jump Rope (Moderate to Fast pace)", category: "Conditioning", met: 11.8, icon: "Activity" },
  { id: "rowing-machine", name: "Rowing Machine (Moderate effort 100W)", category: "Conditioning", met: 7.0, icon: "Activity" },
  { id: "elliptical-trainer", name: "Elliptical Trainer (Moderate pace)", category: "Cardio Machines", met: 5.5, icon: "Activity" },
  { id: "stair-climber", name: "Stairmaster / Stair Stepper", category: "Cardio Machines", met: 9.0, icon: "TrendingUp" },
  { id: "basketball-game", name: "Basketball (Full court game)", category: "Sports", met: 8.0, icon: "Trophy" },
  { id: "soccer-football", name: "Soccer / Football (Competitive match)", category: "Sports", met: 10.0, icon: "Trophy" },
  { id: "tennis-singles", name: "Tennis (Singles match)", category: "Sports", met: 7.3, icon: "Trophy" },
  { id: "badminton-singles", name: "Badminton (Competitive match)", category: "Sports", met: 5.5, icon: "Trophy" },
  { id: "boxing-sparring", name: "Boxing (Sparring / Bag work)", category: "Martial Arts", met: 9.0, icon: "Shield" },
  { id: "yoga-vinyasa", name: "Yoga (Power / Vinyasa flow)", category: "Mind & Body", met: 4.0, icon: "Heart" },
  { id: "yoga-hatha", name: "Yoga (Hatha / Restorative / Stretching)", category: "Mind & Body", met: 2.5, icon: "Heart" },
  { id: "pilates-reformer", name: "Pilates (Mat / Reformer)", category: "Mind & Body", met: 3.5, icon: "Heart" },
  { id: "hiking-crosscountry", name: "Hiking (Cross-country with daypack)", category: "Outdoors", met: 6.5, icon: "Compass" }
];

export function calculateCaloriesBurned(met, weightKg, durationMinutes) {
  if (!met || !weightKg || !durationMinutes) return 0;
  const hours = durationMinutes / 60;
  return Math.round(met * weightKg * hours);
}
