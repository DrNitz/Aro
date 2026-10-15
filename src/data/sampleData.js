// Realistic sample day demonstration data
import { CURATED_FOODS } from './curatedFoods';

export function getSampleDayDiary(dateStr) {
  const oats = CURATED_FOODS.find(f => f.id === 'curated-rolled-oats');
  const yogurt = CURATED_FOODS.find(f => f.id === 'curated-greek-yogurt-0');
  const berries = CURATED_FOODS.find(f => f.id === 'curated-blueberries');
  const chicken = CURATED_FOODS.find(f => f.id === 'curated-chicken-breast');
  const rice = CURATED_FOODS.find(f => f.id === 'curated-brown-rice');
  const broccoli = CURATED_FOODS.find(f => f.id === 'curated-broccoli');
  const salmon = CURATED_FOODS.find(f => f.id === 'curated-salmon-atlantic');
  const sweetPotato = CURATED_FOODS.find(f => f.id === 'curated-sweet-potato');
  const spinach = CURATED_FOODS.find(f => f.id === 'curated-spinach-fresh');
  const oliveOil = CURATED_FOODS.find(f => f.id === 'curated-extra-virgin-olive-oil');
  const egg = CURATED_FOODS.find(f => f.id === 'curated-eggs-large');
  const apple = CURATED_FOODS.find(f => f.id === 'curated-apple-gala');

  function makeLog(food, grams) {
    const factor = grams / 100;
    return {
      id: `log-${food.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      foodId: food.id,
      name: food.name,
      brand: food.brand,
      grams,
      calories: Math.round(food.calories * factor),
      protein: parseFloat((food.protein * factor).toFixed(1)),
      carbs: parseFloat((food.carbs * factor).toFixed(1)),
      fat: parseFloat((food.fat * factor).toFixed(1)),
      fiber: parseFloat(((food.fiber || 0) * factor).toFixed(1)),
      image: food.image,
      nutriscore: food.nutriscore,
      nova: food.nova
    };
  }

  return {
    meals: {
      breakfast: [
        makeLog(oats, 50),
        makeLog(yogurt, 170),
        makeLog(berries, 80)
      ],
      lunch: [
        makeLog(chicken, 180),
        makeLog(rice, 150),
        makeLog(broccoli, 100)
      ],
      dinner: [
        makeLog(salmon, 160),
        makeLog(sweetPotato, 150),
        makeLog(spinach, 50),
        makeLog(oliveOil, 10)
      ],
      snacks: [
        makeLog(egg, 50),
        makeLog(apple, 180)
      ]
    },
    workouts: [
      {
        id: "sample-bench-press",
        exerciseName: "Barbell Bench Press - Medium Grip",
        category: "strength",
        type: "strength",
        muscle: "chest",
        equipment: "barbell",
        sets: [
          { weight: 60, reps: 10 },
          { weight: 70, reps: 8 },
          { weight: 75, reps: 6 },
          { weight: 80, reps: 5 }
        ],
        estimatedOneRepMax: 93,
        totalVolumeKg: 1910,
        caloriesBurned: 120,
        time: "10:15 AM"
      },
      {
        id: "sample-running",
        exerciseName: "Running (6 mph / 10 km/h, ~10 min/mile)",
        category: "cardio",
        type: "cardio",
        muscle: "cardio",
        durationMinutes: 25,
        caloriesBurned: 306,
        met: 9.8,
        time: "05:30 PM"
      }
    ],
    waterMl: 2250,
    notes: "Felt high energy during morning bench press! Hit all protein macros cleanly."
  };
}
