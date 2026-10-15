// Clinical Protocols & Evidence-Based Guidelines
// Sources: AHA/ACC Guidelines, WHO Guidelines on Sodium & Potassium, DASH Clinical Trials, IOM DRI for Fiber

export const CLINICAL_PROTOCOLS = [
  {
    id: 'aha_standard',
    name: 'AHA / WHO General Standard',
    shortName: 'AHA Standard',
    badge: 'Cardioprotective Baseline',
    desc: 'General prevention for healthy adults according to American Heart Association and WHO consensus guidelines.',
    maxSodium: 2300,        // mg
    targetPotassium: 3500,  // mg
    minFiberPer1000Kcal: 14, // g per 1000 kcal
    maxSatFatPercent: 10,   // % of total energy
    targetMagnesium: 400,   // mg
    targetCalcium: 1000,    // mg
    citation: 'AHA/ACC 2017 & WHO 2012 Guideline on Sodium Intake for Adults'
  },
  {
    id: 'dash_cardio',
    name: 'DASH / Therapeutic Protocol',
    shortName: 'DASH Protocol',
    badge: 'Hypertension Management',
    desc: 'Dietary Approaches to Stop Hypertension (DASH trial). Therapeutic sodium restriction with enhanced potassium for vascular compliance.',
    maxSodium: 1500,        // mg
    targetPotassium: 4700,  // mg
    minFiberPer1000Kcal: 16, // g per 1000 kcal
    maxSatFatPercent: 6,    // % of total energy
    targetMagnesium: 420,   // mg
    targetCalcium: 1200,    // mg
    citation: 'Appel LJ, et al. DASH Collaborative Research Group. N Engl J Med. 1997'
  },
  {
    id: 'athletic_exertion',
    name: 'Athletic & Heavy Exertion',
    shortName: 'Athletic Electrolytes',
    badge: 'High Sweat Rate',
    desc: 'Designed for endurance athletes and heavy resistance training to compensate for sweat electrolyte losses (~900–1400mg Na+/L sweat).',
    maxSodium: 4200,        // mg
    targetPotassium: 4000,  // mg
    minFiberPer1000Kcal: 14, // g
    maxSatFatPercent: 10,   // %
    targetMagnesium: 500,   // mg
    targetCalcium: 1000,    // mg
    citation: 'American College of Sports Medicine (ACSM) Joint Position Statement: Nutrition and Athletic Performance'
  },
  {
    id: 'renal_restricted',
    name: 'Renal / Electrolyte Restricted',
    shortName: 'Renal Guide',
    badge: 'CKD Care Guideline',
    desc: 'Controlled potassium and sodium intake designed to prevent hyperkalemia and fluid overload in compromised renal filtration.',
    maxSodium: 1500,        // mg
    targetPotassium: 2200,  // mg (Upper limit)
    isPotassiumCeiling: true,
    minFiberPer1000Kcal: 12, // g
    maxSatFatPercent: 7,    // %
    targetMagnesium: 320,   // mg
    targetCalcium: 1000,    // mg
    citation: 'KDOQI Clinical Practice Guideline for Nutrition in CKD (2020 Update)'
  },
  {
    id: 'low_carb_keto',
    name: 'Low-Carb / Ketogenic Protocol',
    shortName: 'Keto Natriuresis',
    badge: 'Natriuresis Support',
    desc: 'Compensates for the natriuresis of fasting and reduced insulin levels, which accelerate renal sodium and mineral excretion.',
    maxSodium: 4500,        // mg
    targetPotassium: 3600,  // mg
    minFiberPer1000Kcal: 12, // g
    maxSatFatPercent: 25,   // %
    targetMagnesium: 450,   // mg
    targetCalcium: 1000,    // mg
    citation: 'Volek JS, Phinney SD. The Art and Science of Low Carbohydrate Living'
  }
];

/**
 * Calculates Cardioprotective Status and generates dynamic Dr. Aro clinical notes
 */
export function generateDoctorClinicalAssessment(totals, protocol, totalCaloriesEaten) {
  const sodium = totals.sodium || 0;
  const potassium = totals.potassium || 0;
  const fiber = totals.fiber || 0;
  const saturatedFat = totals.saturatedFat || 0;

  // Sodium to Potassium Molar / Mass Ratio
  const naKRatio = potassium > 0 ? parseFloat((sodium / potassium).toFixed(2)) : (sodium > 0 ? 3.0 : 0.5);

  let ratioStatus = 'optimal';
  let ratioColor = '#10b981';
  let ratioText = 'Cardioprotective (Optimal < 1.0)';

  if (naKRatio > 2.0) {
    ratioStatus = 'high_risk';
    ratioColor = '#f43f5e';
    ratioText = 'Atherogenic Risk (> 2.0)';
  } else if (naKRatio >= 1.0) {
    ratioStatus = 'moderate';
    ratioColor = '#f59e0b';
    ratioText = 'Borderline Balance (1.0 - 2.0)';
  }

  // Fiber Density (grams per 1000 kcal)
  const calories = Math.max(1200, totalCaloriesEaten || 2000);
  const fiberDensity = parseFloat(((fiber / calories) * 1000).toFixed(1));
  const fiberTarget = Math.round((calories / 1000) * protocol.minFiberPer1000Kcal);

  // Saturated Fat Percentage of Energy
  const satFatCalories = saturatedFat * 9;
  const satFatPercent = parseFloat(((satFatCalories / calories) * 100).toFixed(1));

  // Synthesize Doctor's Clinical Note
  const notes = [];

  // 1. Sodium-to-Potassium Balance Commentary
  if (sodium > protocol.maxSodium && naKRatio > 1.8) {
    notes.push(
      `⚠️ Elevated Sodium & Vascular Tone: Logged sodium is ${sodium}mg (exceeding the ${protocol.maxSodium}mg ${protocol.shortName} ceiling) with a high Na:K ratio of ${naKRatio}. High sodium without potassium counterbalance promotes endothelial stiffening and fluid retention.`
    );
  } else if (sodium > protocol.maxSodium && naKRatio <= 1.0) {
    notes.push(
      `⚖️ Buffered Sodium Intake: While sodium is elevated at ${sodium}mg, your high potassium intake (${potassium}mg) delivers a favorable Na:K ratio of ${naKRatio}, providing vascular buffering against arterial tension.`
    );
  } else if (naKRatio <= 1.0 && potassium >= protocol.targetPotassium * 0.7) {
    notes.push(
      `🫀 Cardioprotective Electrolyte Profile: Your Na:K ratio is ${naKRatio} (optimal < 1.0). In clinical cardiology trials, higher dietary potassium relative to sodium correlates with reduced stroke incidence and relaxed arterial tone.`
    );
  } else if (potassium < protocol.targetPotassium * 0.4 && sodium > 1000) {
    notes.push(
      `📉 Low Potassium Intake: Logged potassium is only ${potassium}mg against the ${protocol.targetPotassium}mg target. Prioritize potassium-rich whole foods (spinach, avocados, wild salmon, sweet potatoes) to support cardiovascular homeostasis.`
    );
  }

  // 2. Dietary Fiber Assessment
  if (fiber < fiberTarget * 0.5 && totalCaloriesEaten > 800) {
    notes.push(
      `🌾 Fiber Deficit (${fiber}g / ${fiberTarget}g target): Current intake is ${fiberDensity}g/1000 kcal (recommended $\\ge$ ${protocol.minFiberPer1000Kcal}g). Adequate soluble fiber binds dietary bile acids to optimize LDL-C clearance and feeds gut microbiome short-chain fatty acid (SCFA) synthesis.`
    );
  } else if (fiber >= fiberTarget) {
    notes.push(
      `✅ Optimal Glycemic & Microbiome Fiber: Logged ${fiber}g of dietary fiber (${fiberDensity}g/1000 kcal), promoting stable postprandial glucose regulation and optimal colonic motility.`
    );
  }

  // 3. Saturated Fat Commentary
  if (satFatPercent > protocol.maxSatFatPercent && totalCaloriesEaten > 800) {
    notes.push(
      `🩺 Saturated Fat Ceiling (${satFatPercent}% vs ${protocol.maxSatFatPercent}% target): Saturated fatty acids currently represent ${satFatPercent}% of daily energy. The AHA and ACC recommend limiting saturated fats to prevent hepatic LDL-receptor downregulation and ApoB particle increases.`
    );
  }

  if (notes.length === 0) {
    notes.push(
      `🩺 Balanced Clinical Architecture: Electrolyte ratios and macronutrient partitions are aligning well with the ${protocol.name} benchmarks.`
    );
  }

  return {
    naKRatio,
    ratioStatus,
    ratioColor,
    ratioText,
    fiberDensity,
    fiberTarget,
    satFatPercent,
    doctorNotes: notes
  };
}
