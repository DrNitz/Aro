import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  ShieldCheck, 
  Trash2, 
  AlertTriangle, 
  Check
} from 'lucide-react';
import { exportAllData, importAllData } from '../services/storage';
import { useEscapeKey } from '../hooks/useEscapeKey';

export default function DataManagementModal({
  onClose,
  onDataImported,
  onClearAllData
}) {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEscapeKey(onClose);

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
      <div
        className="modal-card data-management-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-mgmt-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <ShieldCheck className="text-primary" size={22} />
            <h3 className="modal-product-title" id="data-mgmt-title">Privacy & Data Management</h3>
          </div>
          <button className="btn-icon btn-secondary" onClick={onClose} aria-label="Close data management">
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
            <button type="button" className="backup-box glass-card" onClick={handleExport}>
              <Download size={24} className="text-primary" />
              <h4>Export Backup</h4>
              <p>Download a complete JSON file containing your logs, recipes, and targets.</p>
              <span className="btn btn-primary btn-sm">
                <Download size={14} />
                <span>Export JSON</span>
              </span>
            </button>

            <button type="button" className="backup-box glass-card" onClick={() => fileInputRef.current?.click()}>
              <Upload size={24} className="text-cyan" />
              <h4>Restore Backup</h4>
              <p>Import your previously saved Aro backup file to restore all entries.</p>
              <span className="btn btn-secondary btn-sm">
                <Upload size={14} />
                <span>Upload JSON</span>
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                aria-label="Upload Aro backup file"
              />
            </button>
          </div>

          {importStatus && (
            <div
              className={`status-banner ${importStatus.type === 'success' ? 'status-success' : 'status-error'}`}
              role="status"
              aria-live="polite"
            >
              {importStatus.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{importStatus.msg}</span>
            </div>
          )}

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
