import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  AlertTriangle, 
  Check, 
  FileText 
} from 'lucide-react';
import { exportAllData, importAllData } from '../services/storage';

export default function DataManagementModal({
  onClose,
  onLoadDemo,
  onDataImported,
  onClearAllData
}) {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = () => {
    exportAllData();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = importAllData(content);
      if (res.success) {
        setImportStatus({ type: 'success', msg: 'Data imported successfully!' });
        setTimeout(() => {
          onDataImported();
          onClose();
        }, 1200);
      } else {
        setImportStatus({ type: 'error', msg: `Import failed: ${res.error}` });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card data-management-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <ShieldCheck className="text-primary" size={22} />
            <h3 className="modal-product-title">Privacy & Data Management</h3>
          </div>
          <button className="btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Privacy Banner */}
          <div className="privacy-badge-banner">
            <ShieldCheck size={20} className="text-primary" />
            <div className="privacy-banner-text">
              <strong>100% Privacy & Local Storage</strong>
              <p>Like OpenNutriTracker, Aro stores all your meals, workouts, and health data locally in your browser. No forced cloud accounts, no third-party trackers.</p>
            </div>
          </div>

          {/* Export & Import Grid */}
          <div className="backup-options-grid grid-2">
            <div className="glass-card backup-box" onClick={handleExport}>
              <Download size={24} className="text-primary" />
              <h4>Export Backup</h4>
              <p>Download a complete JSON file containing your logs, recipes, and targets.</p>
              <button className="btn btn-primary btn-sm">
                <Download size={14} />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="glass-card backup-box" onClick={() => fileInputRef.current?.click()}>
              <Upload size={24} className="text-cyan" />
              <h4>Restore Backup</h4>
              <p>Import your previously saved Aro backup file to restore all entries.</p>
              <button className="btn btn-secondary btn-sm">
                <Upload size={14} />
                <span>Upload JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {importStatus && (
            <div className={`status-banner ${importStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
              {importStatus.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{importStatus.msg}</span>
            </div>
          )}

          {/* Demo Day Loader */}
          <div className="demo-loader-row glass-card">
            <div className="demo-loader-info">
              <Sparkles size={20} className="text-amber" />
              <div>
                <strong>Explore with Sample Demo Day</strong>
                <p>Loads a realistic day with oats, chicken, salmon, bench press, running, and water tracking.</p>
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => {
                onLoadDemo();
                onClose();
              }}
            >
              Load Demo
            </button>
          </div>

          {/* Reset / Danger Zone */}
          <div className="danger-zone-card">
            {confirmClear ? (
              <div className="confirm-clear-box">
                <AlertTriangle size={20} className="text-coral" />
                <span>Are you sure? This will delete all your local diaries and custom foods.</span>
                <div className="confirm-btn-row">
                  <button className="btn btn-danger btn-sm" onClick={() => { onClearAllData(); onClose(); }}>
                    Yes, Delete Everything
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setConfirmClear(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmClear(true)}>
                <Trash2 size={14} />
                <span>Clear All Aro Local Data</span>
              </button>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
