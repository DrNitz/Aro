import React, { useState, useEffect, useRef } from 'react';
import { X, Scan, Camera, Search, AlertCircle, Loader2, Sparkles, Info } from 'lucide-react';
import { fetchProductByBarcode } from '../services/openFoodFacts';
import { CURATED_FOODS } from '../data/curatedFoods';
import { useEscapeKey } from '../hooks/useEscapeKey';

export default function BarcodeScannerModal({
  onClose,
  onProductFound
}) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [hasCameraSupport, setHasCameraSupport] = useState(true);

  // Native live decoding is only available in Chromium-based browsers.
  // Detect up-front so Safari/iOS never shows a viewfinder that cannot scan.
  const [detectorSupported] = useState(
    () => typeof window !== 'undefined' && 'BarcodeDetector' in window
  );

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectIntervalRef = useRef(null);

  useEscapeKey(onClose);

  // Test barcode presets
  const sampleBarcodes = [
    { label: 'Nutella 400g', code: '3017620422003' },
    { label: 'Coca-Cola Zero', code: '5449000131805' },
    { label: 'Barilla Spaghetti', code: '8076809513753' },
    { label: 'Evian Natural Water', code: '3068320055008' },
    { label: 'Lotus Biscoff Spread', code: '5410126006957' }
  ];

  const handleLookup = async (codeToLookup) => {
    const code = (codeToLookup || barcodeInput).trim();
    if (!code) {
      setError('Please enter a valid barcode numbers.');
      return;
    }

    setLoading(true);
    setError('');

    // Check local curated foods first
    const localMatch = CURATED_FOODS.find(f => f.code === code);
    if (localMatch) {
      setLoading(false);
      stopCamera();
      onProductFound(localMatch);
      return;
    }

    // Query Open Food Facts API
    try {
      const product = await fetchProductByBarcode(code);
      setLoading(false);
      if (product) {
        stopCamera();
        onProductFound(product);
      } else {
        setError(`Product with barcode "${code}" was not found in Open Food Facts. You can create a custom food for it.`);
      }
    } catch {
      setLoading(false);
      setError('Failed to query Open Food Facts API. Please check your connection.');
    }
  };

  const startCamera = async () => {
    setError('');

    if (!detectorSupported) {
      setHasCameraSupport(false);
      setError('Live camera scanning is not supported in this browser (it is available in Chrome and Edge). Please type the barcode number below instead.');
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraSupport(false);
        setError('Camera access is not supported by your browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code']
      });

      detectIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !streamRef.current) {
          clearInterval(detectIntervalRef.current);
          return;
        }
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const detected = barcodes[0].rawValue;
            clearInterval(detectIntervalRef.current);
            setBarcodeInput(detected);
            handleLookup(detected);
          }
        } catch {
          // detection frame skip
        }
      }, 500);
    } catch (err) {
      setHasCameraSupport(false);
      setError('Unable to access camera. Please allow camera permissions or enter the barcode manually.');
    }
  };

  const stopCamera = () => {
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card barcode-modal" role="dialog" aria-modal="true" aria-labelledby="barcode-modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Scan className="text-primary" size={22} />
            <h3 className="modal-product-title" id="barcode-modal-title">Barcode Scanner</h3>
          </div>
          <button className="btn-icon btn-secondary" onClick={onClose} aria-label="Close barcode scanner">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Camera Viewfinder */}
          {cameraActive ? (
            <div className="camera-viewfinder-wrap">
              <video ref={videoRef} className="camera-video-preview" playsInline muted></video>
              <div className="viewfinder-overlay">
                <div className="scan-laser"></div>
                <span className="viewfinder-hint">Align barcode inside the frame</span>
              </div>
              <button className="btn btn-secondary btn-sm stop-camera-btn" onClick={stopCamera}>
                Stop Camera
              </button>
            </div>
          ) : hasCameraSupport ? (
            <div className="camera-placeholder-card" onClick={startCamera}>
              <div className="camera-icon-circle">
                <Camera size={28} className="text-primary" />
              </div>
              <h4 className="camera-prompt-title">Scan Packaged Food</h4>
              <p className="camera-prompt-sub">Use your phone or webcam to scan any UPC/EAN barcode directly</p>
              <button className="btn btn-primary btn-sm" type="button">
                <Camera size={15} />
                <span>Open Camera Scanner</span>
              </button>
            </div>
          ) : (
            <div className="camera-placeholder-card camera-unavailable-card">
              <div className="camera-icon-circle">
                <Camera size={28} className="text-dim" />
              </div>
              <h4 className="camera-prompt-title">Camera scanning unavailable</h4>
              <p className="camera-prompt-sub">
                Your browser doesn&apos;t support live barcode detection. Type the numbers printed under the barcode instead — the lookup below works everywhere.
              </p>
              <div className="camera-fallback-hint">
                <Info size={13} />
                <span>Tip: most bars are in Chrome or Edge on desktop, or Chrome on Android.</span>
              </div>
            </div>
          )}

          {/* Manual Barcode Input */}
          <div className="manual-barcode-section">
            <label className="input-label" htmlFor="barcode-manual-input">Or Enter Barcode (EAN-13 / UPC)</label>
            <div className="manual-input-row">
              <input
                id="barcode-manual-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 3017620422003"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="input-field mono"
              />
              <button 
                className="btn btn-primary" 
                onClick={() => handleLookup()} 
                disabled={loading || !barcodeInput.trim()}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                <span>Lookup</span>
              </button>
            </div>

            {error && (
              <div className="barcode-error-banner">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Popular Real Product Barcode Presets */}
          <div className="sample-barcodes-block">
            <span className="sample-barcodes-title">
              <Sparkles size={14} className="text-amber" />
              Quick Test Real Barcodes:
            </span>
            <div className="sample-barcodes-grid">
              {sampleBarcodes.map((item) => (
                <button
                  key={item.code}
                  className="sample-barcode-btn"
                  onClick={() => {
                    setBarcodeInput(item.code);
                    handleLookup(item.code);
                  }}
                >
                  <span className="sample-name">{item.label}</span>
                  <span className="sample-code mono">{item.code}</span>
                </button>
              ))}
            </div>
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
