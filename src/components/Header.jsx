import React from 'react';
import { 
  Flame, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Download, 
  Sparkles,
  Utensils, 
  Dumbbell, 
  Target, 
  BookOpen,
  Stethoscope
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  currentDate,
  setCurrentDate,
  netCalories,
  targetCalories,
  theme,
  toggleTheme,
  onOpenDataModal,
  onOpenOnboarding
}) {
  const isToday = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return currentDate === todayStr;
  };

  const handlePrevDay = () => {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().slice(0, 10));
  };

  const handleSetToday = () => {
    setCurrentDate(new Date().toISOString().slice(0, 10));
  };

  const formatDateDisplay = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  };

  const navItems = [
    { id: 'diary', label: 'Diary', icon: BookOpen },
    { id: 'food', label: 'Food & Nutrition', icon: Utensils },
    { id: 'exercise', label: 'Workouts', icon: Dumbbell },
    { id: 'goals', label: 'Goals & Body', icon: Target },
  ];

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand & Logo */}
        <div className="brand-group">
          <div className="brand-logo" onClick={() => setActiveTab('diary')}>
            <div className="logo-icon-wrap">
              <Flame className="logo-flame" size={22} />
              <div className="logo-pulse"></div>
            </div>
            <div className="brand-text">
              <span className="brand-name">Aro</span>
              <span className="brand-tagline">Health & Nutrition</span>
            </div>
          </div>

          {/* Date Navigator */}
          <div className="date-nav">
            <button 
              className="btn-date-arrow" 
              onClick={handlePrevDay}
              title="Previous Day"
              aria-label="Previous day"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="date-display-pill">
              <Calendar size={15} className="date-icon" />
              <input 
                type="date" 
                value={currentDate} 
                onChange={(e) => setCurrentDate(e.target.value)}
                className="date-input-overlay"
              />
              <span className="date-label">
                {isToday() ? 'Today, ' : ''}{formatDateDisplay(currentDate)}
              </span>
            </div>

            <button 
              className="btn-date-arrow" 
              onClick={handleNextDay}
              title="Next Day"
              aria-label="Next day"
            >
              <ChevronRight size={18} />
            </button>

            {!isToday() && (
              <button className="btn-today-badge" onClick={handleSetToday}>
                Today
              </button>
            )}
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="header-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-tab ${isActive ? 'nav-tab-active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {isActive && <div className="nav-indicator"></div>}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Calorie Pill, Clinical Profile, Backup, Theme */}
        <div className="header-actions">
          {/* Net Calorie Quick Stat */}
          <div className="net-calorie-pill" title="Daily Net Calories (Food - Exercise / Target)">
            <Flame size={15} className="net-cal-icon" />
            <div className="net-cal-numbers">
              <span className="net-cal-val">{netCalories.toLocaleString()}</span>
              <span className="net-cal-target">/ {targetCalories.toLocaleString()} kcal</span>
            </div>
          </div>

          {/* Clinical Profile Setup & Formulas Button */}
          {onOpenOnboarding && (
            <button 
              className="btn btn-secondary btn-clinical-header" 
              onClick={onOpenOnboarding}
              title="Clinical Profile & Scientific Formulas"
              aria-label="Clinical Profile"
            >
              <Stethoscope size={16} className="text-primary" />
              <span className="btn-clinical-label">Clinical Profile</span>
            </button>
          )}

          {/* Backup / Export */}
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onOpenDataModal}
            title="Data Backup & Sync"
            aria-label="Data Backup"
          >
            <Download size={17} />
          </button>

          {/* Theme Toggle */}
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`mobile-nav-btn ${isActive ? 'mobile-nav-active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
