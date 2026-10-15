import React, { useState } from 'react';
import { 
  Stethoscope, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  Info,
  Layers,
  Scale
} from 'lucide-react';
import { CLINICAL_PROTOCOLS, generateDoctorClinicalAssessment } from '../data/clinicalProtocols';

export default function ClinicalAuditPanel({
  totals,
  totalCaloriesEaten,
  activeProtocolId = 'aha_standard',
  onSelectProtocol
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentProtocol = CLINICAL_PROTOCOLS.find(p => p.id === activeProtocolId) || CLINICAL_PROTOCOLS[0];
  const assessment = generateDoctorClinicalAssessment(totals, currentProtocol, totalCaloriesEaten);

  // Position needle along spectrum (0.0 to 3.0 ratio mapped to 0% to 100%)
  const needlePercent = Math.min(96, Math.max(4, (assessment.naKRatio / 3.0) * 100));

  // Progress calculations
  const sodiumPercent = Math.min(100, Math.round(((totals.sodium || 0) / currentProtocol.maxSodium) * 100));
  const potassiumPercent = Math.min(100, Math.round(((totals.potassium || 0) / currentProtocol.targetPotassium) * 100));
  const fiberPercent = Math.min(100, Math.round(((totals.fiber || 0) / assessment.fiberTarget) * 100));
  const satFatPercent = assessment.satFatPercent;

  return (
    <div className="glass-card clinical-audit-panel">
      {/* Header with Mini Ratio Pill & Toggle */}
      <div 
        className="clinical-audit-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className="audit-header-left">
          <div className="audit-icon-wrap">
            <Stethoscope size={20} className="text-primary" />
          </div>
          <div className="audit-header-titles">
            <div className="audit-title-row">
              <h3 className="audit-main-title">Doctor's Micronutrient & Electrolyte Audit</h3>
              <span className="badge badge-doctor">Clinical Intelligence</span>
            </div>
            <p className="audit-subtitle">
              Physiological cardiovascular & electrolyte risk stratification (AHA / WHO / DASH)
            </p>
          </div>
        </div>

        <div className="audit-header-right">
          {/* Cardioprotective Ratio Mini Pill */}
          <div 
            className="audit-ratio-pill" 
            style={{ 
              borderColor: `${assessment.ratioColor}40`,
              backgroundColor: `${assessment.ratioColor}15`
            }}
          >
            <span className="ratio-pill-label">Na:K</span>
            <span className="ratio-pill-val mono" style={{ color: assessment.ratioColor }}>
              {assessment.naKRatio}
            </span>
            <span className="ratio-pill-status" style={{ color: assessment.ratioColor }}>
              {assessment.ratioStatus === 'optimal' ? 'Cardioprotective' : assessment.ratioStatus === 'moderate' ? 'Moderate' : 'Elevated'}
            </span>
          </div>

          <button 
            type="button" 
            className="btn-icon btn-secondary btn-toggle-audit"
            aria-label={isExpanded ? 'Collapse audit' : 'Expand audit'}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Clinical Diagnostics Section */}
      {isExpanded && (
        <div className="clinical-audit-body">
          {/* Protocol Selector Chips */}
          <div className="protocol-selector-block">
            <span className="protocol-selector-label">
              <Layers size={14} className="text-cyan" />
              <span>Select Active Clinical Guideline Protocol:</span>
            </span>
            <div className="protocol-chips-row">
              {CLINICAL_PROTOCOLS.map((p) => {
                const isActive = p.id === currentProtocol.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`protocol-chip ${isActive ? 'protocol-chip-active' : ''}`}
                    onClick={() => onSelectProtocol && onSelectProtocol(p.id)}
                  >
                    <span className="chip-protocol-name">{p.shortName}</span>
                    <span className="chip-protocol-badge">{p.badge}</span>
                  </button>
                );
              })}
            </div>
            <p className="protocol-description-sub">
              <strong>{currentProtocol.name}:</strong> {currentProtocol.desc}
              <span className="protocol-citation"> — {currentProtocol.citation}</span>
            </p>
          </div>

          {/* Interactive Cardioprotective Na:K Ratio Meter */}
          <div className="cardioprotective-ratio-card">
            <div className="ratio-card-top">
              <div className="ratio-title-group">
                <Heart size={18} className="text-coral" />
                <span className="ratio-card-title">Cardioprotective Sodium-to-Potassium (Na:K) Ratio</span>
              </div>
              <div className="ratio-score-group">
                <span className="ratio-big-val mono" style={{ color: assessment.ratioColor }}>
                  {assessment.naKRatio}
                </span>
                <span className="ratio-status-badge" style={{ backgroundColor: `${assessment.ratioColor}20`, color: assessment.ratioColor, border: `1px solid ${assessment.ratioColor}50` }}>
                  {assessment.ratioText}
                </span>
              </div>
            </div>

            {/* Spectrum Track: <1.0 Optimal (Green) | 1.0-2.0 Moderate (Amber) | >2.0 High Risk (Coral) */}
            <div className="ratio-spectrum-track">
              <div className="ratio-seg seg-optimal" title="Cardioprotective: < 1.0"></div>
              <div className="ratio-seg seg-moderate" title="Moderate Balance: 1.0 - 2.0"></div>
              <div className="ratio-seg seg-risk" title="Atherogenic Risk: > 2.0"></div>

              {/* Dynamic Needle Pin */}
              <div className="ratio-needle-indicator" style={{ left: `${needlePercent}%` }}>
                <div className="ratio-needle-pin"></div>
                <span className="ratio-needle-val mono">{assessment.naKRatio}</span>
              </div>
            </div>

            <div className="ratio-scale-labels">
              <span>&lt; 1.0 (Cardioprotective)</span>
              <span>1.0 – 2.0 (Moderate Balance)</span>
              <span>&gt; 2.0 (Arterial / Stroke Risk)</span>
            </div>

            <p className="ratio-medical-note">
              <ShieldCheck size={14} className="text-primary" />
              <span>
                <strong>Clinical Physiology:</strong> Higher dietary potassium relaxes vascular smooth muscle and promotes natriuresis. The <em>New England Journal of Medicine</em> and DASH trials establish that keeping Na:K below 1.0 is more protective against stroke than sodium reduction alone.
              </span>
            </p>
          </div>

          {/* Core Micronutrient & Electrolyte Matrix Grid */}
          <div className="micronutrient-matrix-grid grid-2">
            {/* Sodium Card */}
            <div className="nutrient-audit-card">
              <div className="nutrient-audit-header">
                <span className="nutrient-name">Sodium (Na⁺)</span>
                <span className={`nutrient-badge-state ${totals.sodium > currentProtocol.maxSodium ? 'badge-warn' : 'badge-good'}`}>
                  {totals.sodium > currentProtocol.maxSodium ? 'Ceiling Exceeded' : 'Within Boundary'}
                </span>
              </div>
              <div className="nutrient-values-row">
                <span className="nutrient-current mono">{totals.sodium || 0} mg</span>
                <span className="nutrient-target mono">/ max {currentProtocol.maxSodium} mg</span>
              </div>
              <div className="nutrient-bar-track">
                <div 
                  className={`nutrient-bar-fill ${totals.sodium > currentProtocol.maxSodium ? 'fill-coral' : 'fill-primary'}`}
                  style={{ width: `${sodiumPercent}%` }}
                ></div>
              </div>
              <span className="nutrient-footer-hint">
                AHA Guideline: Limit sodium to prevent plasma volume expansion
              </span>
            </div>

            {/* Potassium Card */}
            <div className="nutrient-audit-card">
              <div className="nutrient-audit-header">
                <span className="nutrient-name">Potassium (K⁺)</span>
                <span className={`nutrient-badge-state ${potassiumPercent >= 100 ? 'badge-good' : 'badge-neutral'}`}>
                  {potassiumPercent}% of Target
                </span>
              </div>
              <div className="nutrient-values-row">
                <span className="nutrient-current mono">{totals.potassium || 0} mg</span>
                <span className="nutrient-target mono">/ goal {currentProtocol.targetPotassium} mg</span>
              </div>
              <div className="nutrient-bar-track">
                <div 
                  className="nutrient-bar-fill fill-cyan"
                  style={{ width: `${potassiumPercent}%` }}
                ></div>
              </div>
              <span className="nutrient-footer-hint">
                Essential for cardiac rhythm and counteracting dietary sodium
              </span>
            </div>

            {/* Dietary Fiber Card */}
            <div className="nutrient-audit-card">
              <div className="nutrient-audit-header">
                <span className="nutrient-name">Dietary Fiber</span>
                <span className={`nutrient-badge-state ${fiberPercent >= 100 ? 'badge-good' : 'badge-warn'}`}>
                  {assessment.fiberDensity}g / 1000 kcal
                </span>
              </div>
              <div className="nutrient-values-row">
                <span className="nutrient-current mono">{totals.fiber || 0}g</span>
                <span className="nutrient-target mono">/ target {assessment.fiberTarget}g</span>
              </div>
              <div className="nutrient-bar-track">
                <div 
                  className="nutrient-bar-fill fill-emerald"
                  style={{ width: `${fiberPercent}%` }}
                ></div>
              </div>
              <span className="nutrient-footer-hint">
                Goal: ≥ {currentProtocol.minFiberPer1000Kcal}g/1000 kcal for LDL-C reduction and microbiome SCFA
              </span>
            </div>

            {/* Saturated Fat Card */}
            <div className="nutrient-audit-card">
              <div className="nutrient-audit-header">
                <span className="nutrient-name">Saturated Fatty Acids</span>
                <span className={`nutrient-badge-state ${satFatPercent > currentProtocol.maxSatFatPercent ? 'badge-warn' : 'badge-good'}`}>
                  {satFatPercent}% of Calories
                </span>
              </div>
              <div className="nutrient-values-row">
                <span className="nutrient-current mono">{totals.saturatedFat || 0}g</span>
                <span className="nutrient-target mono">/ cap &lt; {currentProtocol.maxSatFatPercent}% of kcal</span>
              </div>
              <div className="nutrient-bar-track">
                <div 
                  className={`nutrient-bar-fill ${satFatPercent > currentProtocol.maxSatFatPercent ? 'fill-coral' : 'fill-primary'}`}
                  style={{ width: `${Math.min(100, (satFatPercent / currentProtocol.maxSatFatPercent) * 100)}%` }}
                ></div>
              </div>
              <span className="nutrient-footer-hint">
                AHA Guideline: Prevent hepatic LDL receptor downregulation
              </span>
            </div>
          </div>

          {/* Secondary Minerals Quick Strip */}
          <div className="secondary-minerals-strip">
            <div className="mineral-mini-box">
              <span className="mineral-mini-label">Magnesium (Mg²⁺)</span>
              <span className="mineral-mini-val mono">
                {totals.magnesium || 0} / {currentProtocol.targetMagnesium} mg
              </span>
            </div>
            <div className="mineral-mini-box">
              <span className="mineral-mini-label">Calcium (Ca²⁺)</span>
              <span className="mineral-mini-val mono">
                {totals.calcium || 0} / {currentProtocol.targetCalcium} mg
              </span>
            </div>
            <div className="mineral-mini-box">
              <span className="mineral-mini-label">Free / Added Sugars</span>
              <span className="mineral-mini-val mono">
                {totals.sugar || 0}g / max 36g
              </span>
            </div>
          </div>

          {/* Dr. Aro Automated Clinical Assessment */}
          <div className="doctor-clinical-insight-card">
            <div className="insight-doctor-avatar">
              <img 
                src="/images/dr_aro_mascot.jpg" 
                alt="Dr. Aro Mascot" 
                className="doctor-avatar-round"
              />
            </div>
            <div className="insight-content">
              <div className="insight-title-row">
                <Sparkles size={14} className="text-primary" />
                <span className="insight-doctor-name">Dr. Aro — Dynamic Clinical Intelligence</span>
                <span className="badge badge-cyan">{currentProtocol.shortName}</span>
              </div>
              <div className="insight-notes-list">
                {assessment.doctorNotes.map((note, index) => (
                  <p key={index} className="insight-note-p">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
