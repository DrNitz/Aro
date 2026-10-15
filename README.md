# Aro — Open Nutrition & Fitness Companion 🥗🏋️

A privacy-first, open-source nutrition, calorie, macro, and workout tracking web application inspired by **OpenNutriTracker**, powered by **Open Food Facts** and the **Free Exercise DB**.

![Aro Preview](https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80)

---

## ✨ Features

### 1. 📊 Daily Diary & Macro Concentric Rings
* **Concentric Radial Rings**: Real-time progress visualizer for Calories, Protein, Carbohydrates, and Fat.
* **Energy Balance Equation**: `Target Goal - Food Logged + Calories Burned = Net Remaining`.
* **Meal Logs**: Breakdown across **Breakfast**, **Lunch**, **Dinner**, and **Snacks & Extras** with instant portion adjusters and 1-click delete/edit.
* **Celebration Confetti**: Dynamic micro-animations when goals and meals are logged.

### 2. ⏱️ Intermittent Fasting & Hydration Trackers
* **Fasting Timer**: 16:8 standard, 18:6, or 20:4 intermittent fasting timer with live elapsed countdown and metabolic stage indicators (Digestive rest, Insulin drop, Ketosis, Autophagy).
* **Hydration Tracker**: Target intake (e.g. 3,000 mL) with fluid animation reservoir and quick-add buttons (`+250ml`, `+500ml`, `+750ml`).

### 3. 🔍 Open Food Facts & Barcode Scanner
* **Open Food Facts Live API**: Search millions of packaged and brand products across the globe without API keys.
* **Nutri-Score & NOVA Badges**: Displays official nutritional grading (A to E) and ultra-processing classification (Groups 1–4).
* **Barcode Scanner**: Camera-based live scanner and manual EAN-13 / UPC lookup with quick test presets (Nutella, Coca-Cola Zero, Barilla, etc.).
* **Verified Whole Foods Offline Database**: Instant sub-millisecond search for staple whole foods (chicken breast, oats, avocado, salmon, eggs, fruits, veggies).
* **Custom Food Creator**: Easily create and save homemade recipes with personalized macros.

### 4. 🏋️ Open Exercise Database & Workout Logger
* **870+ Public Domain Exercises**: Comprehensive exercise directory with muscle targeting, equipment requirements, difficulty, and step-by-step instructions.
* **Resistance Training Logger**: Multi-set logger tracking weight (kg) and reps. Automatically computes total tonnage volume and **Estimated 1-Rep Max (1RM)** using the Brzycki equation.
* **Cardio & Sports MET Burn Calculator**: Accurately computes calories burned for over 25 activities (running, cycling, swimming, HIIT, sports) using scientific MET values mapped to your body weight.

### 5. 🎯 Body Goals & TDEE / BMR Planner
* **Mifflin-St Jeor Calculator**: Computes your personal BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure) based on gender, age, height, weight, and activity level.
* **Goal Presets**: Fat Loss Cut (-500 kcal), Mild Recomp (-250 kcal), Maintenance, Lean Bulk (+250 kcal), or Hypertrophy Bulk (+500 kcal).
* **Macro Strategies**: High Protein (40/35/25), Balanced (30/40/30), Low Carb (30/20/50), or Keto (20/5/75).
* **Weight Tracker & Trend Chart**: SVG line chart tracking weigh-ins over time relative to your goal weight.
* **BMI Metric**: Body Mass Index with colored range bar indicator.

### 6. 🔒 100% Privacy & Offline-First (Local Storage)
* **Zero forced logins** or third-party tracking. All your data stays in your browser's local storage.
* **Full Data Export & Import**: Export your complete diary and recipes as a `.json` backup file or restore anytime.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/DrNitz/Aro.git
cd Aro

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack
* **Framework**: React 19 + Vite 8
* **Styling**: Vanilla CSS (Tailored Design System, Dark/Light Themes, Glassmorphism, Google Fonts `Outfit` & `Plus Jakarta Sans`)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Animations**: Canvas Confetti
* **Data Sources**:
  * [Open Food Facts API](https://world.openfoodfacts.org/)
  * [Free Exercise DB](https://github.com/yuhonas/free-exercise-db)
  * [Compendium of Physical Activities (MET)](https://sites.google.com/site/compendiumofphysicalactivities/)

## 🔍 Search Engine Optimization (SEO) & PWA
* **Physician E-E-A-T Structured Data**: Schema.org JSON-LD graph declaring `WebApplication` and `MedicalWebPage` with physician attribution.
* **Progressive Web App (PWA)**: Full offline-capable `manifest.json` and Service Worker (`sw.js`). Installable on iOS Safari, Android Chrome, and Desktop with zero app store fees.
* **Social Sharing**: Open Graph & Twitter Cards with 3D Aro mascot visual previews.
* **Crawlability**: Automated `sitemap.xml` and `robots.txt` optimized for Cloudflare Pages edge deployment.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE). Exercise data is public domain. Food data is provided under the Open Database License (ODbL) via Open Food Facts.
