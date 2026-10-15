// Open Food Facts API service
// Direct access with User-Agent header according to Open Food Facts guidelines

const USER_AGENT = "AroHealthApp/1.0 (https://github.com/DrNitz/Aro; contact@arohealth.org)";

/**
 * Normalizes Open Food Facts raw product to standard Aro Food object
 */
export function normalizeOffProduct(raw) {
  if (!raw) return null;
  const nutriments = raw.nutriments || {};

  // Extract calories: energy-kcal_100g, or convert energy-kj / 4.184
  let calories = 0;
  if (nutriments['energy-kcal_100g'] !== undefined) {
    calories = Math.round(Number(nutriments['energy-kcal_100g']) || 0);
  } else if (nutriments['energy-kcal'] !== undefined) {
    calories = Math.round(Number(nutriments['energy-kcal']) || 0);
  } else if (nutriments['energy_100g'] !== undefined) {
    // Usually in kJ
    calories = Math.round((Number(nutriments['energy_100g']) || 0) / 4.184);
  }

  const protein = parseFloat((Number(nutriments.proteins_100g ?? nutriments.proteins ?? 0)).toFixed(1));
  const carbs = parseFloat((Number(nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 0)).toFixed(1));
  const fat = parseFloat((Number(nutriments.fat_100g ?? nutriments.fat ?? 0)).toFixed(1));
  const saturatedFat = parseFloat((Number(nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat'] ?? 0)).toFixed(1));
  const fiber = parseFloat((Number(nutriments.fiber_100g ?? nutriments.fiber ?? 0)).toFixed(1));
  const sugar = parseFloat((Number(nutriments.sugars_100g ?? nutriments.sugars ?? 0)).toFixed(1));
  const sodium = Math.round((Number(nutriments.sodium_100g ?? 0) * 1000) || (Number(nutriments.salt_100g ?? 0) * 400));

  // Potassium in mg
  const potRaw = Number(nutriments.potassium_100g ?? nutriments.potassium ?? 0);
  const potassium = potRaw > 20 ? Math.round(potRaw) : Math.round(potRaw * 1000);

  // Calcium in mg
  const caRaw = Number(nutriments.calcium_100g ?? nutriments.calcium ?? 0);
  const calcium = caRaw > 20 ? Math.round(caRaw) : Math.round(caRaw * 1000);

  // Magnesium in mg
  const mgRaw = Number(nutriments.magnesium_100g ?? nutriments.magnesium ?? 0);
  const magnesium = mgRaw > 20 ? Math.round(mgRaw) : Math.round(mgRaw * 1000);

  const nutriscore = (raw.nutriscore_grade || raw.nutrition_grades || '').toLowerCase();
  const nova = raw.nova_group || raw.nova_groups || null;

  const image = raw.image_front_small_url || raw.image_front_url || raw.image_url || null;
  const name = raw.product_name || raw.product_name_en || raw.generic_name || "Unknown Product";
  const brand = raw.brands || raw.brands_tags?.[0] || "Open Food Facts";

  // Parse serving quantity
  let servingGrams = 100;
  if (raw.serving_quantity) {
    servingGrams = Number(raw.serving_quantity) || 100;
  }

  return {
    id: `off-${raw.code || raw.id || Math.random().toString(36).substring(7)}`,
    code: raw.code || "",
    name,
    brand,
    category: raw.categories_tags?.[0]?.replace(/^en:/, '').replace(/-/g, ' ') || "Packaged Food",
    calories,
    protein,
    carbs,
    fat,
    saturatedFat,
    fiber,
    sugar,
    sodium,
    potassium,
    calcium,
    magnesium,
    servingSize: 100,
    servingUnit: "g",
    commonServing: {
      name: raw.serving_size ? `1 Serving (${raw.serving_size})` : "1 Serving (100g)",
      grams: servingGrams
    },
    nutriscore: ['a', 'b', 'c', 'd', 'e'].includes(nutriscore) ? nutriscore : null,
    nova: [1, 2, 3, 4].includes(Number(nova)) ? Number(nova) : null,
    image,
    source: "openfoodfacts"
  };
}

/**
 * Fetch product by Barcode (UPC/EAN)
 */
export async function fetchProductByBarcode(barcode) {
  const cleanCode = barcode.trim();
  if (!cleanCode) return null;

  // Try direct OFF v2 API first
  const urls = [
    `https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json`,
    `/api/off/api/v2/product/${cleanCode}.json`,
    `https://world.openfoodfacts.net/api/v2/product/${cleanCode}.json`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT
        }
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.status === 1 && data.product) {
        return normalizeOffProduct(data.product);
      }
    } catch {
      // try next URL
    }
  }

  return null;
}

/**
 * Search Open Food Facts live database
 */
export async function searchOpenFoodFacts(query, pageSize = 24) {
  const q = encodeURIComponent(query.trim());
  if (!q) return [];

  // 1. Try Search-a-licious / search API
  try {
    const searchUrl = `/api/off-search/search?q=${q}&page_size=${pageSize}`;
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (res.ok) {
      const data = await res.json();
      const hits = data.hits || data.products || [];
      if (hits.length > 0) {
        return hits.map(normalizeOffProduct).filter(p => p.name && (p.calories > 0 || p.protein > 0 || p.carbs > 0));
      }
    }
  } catch {
    // fallback to world v2
  }

  // 2. Try world.openfoodfacts.org v2 search endpoint
  try {
    const v2Url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${q}&page_size=${pageSize}&fields=code,product_name,brands,nutriments,image_front_small_url,nutriscore_grade,nova_group,serving_size,serving_quantity`;
    const res = await fetch(v2Url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (res.ok) {
      const data = await res.json();
      const products = data.products || [];
      if (products.length > 0) {
        return products.map(normalizeOffProduct).filter(p => p.name);
      }
    }
  } catch {
    // fallback
  }

  return [];
}
