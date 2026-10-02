import React, { createContext, useContext, useState, useEffect } from 'react';

const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  const [scanResult, setScanResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem('roast_last_scan');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [intensity, setIntensity] = useState('brutal');
  const [recruiterMode, setRecruiterMode] = useState(false);

  useEffect(() => {
    if (scanResult) {
      try {
        sessionStorage.setItem('roast_last_scan', JSON.stringify(scanResult));
      } catch (e) {
        console.warn('Could not cache scan to session storage', e);
      }
    }
  }, [scanResult]);

  const updateRoast = (newRoastData) => {
    if (!scanResult) return;
    setScanResult(prev => ({
      ...prev,
      roast: {
        ...prev.roast,
        ...newRoastData
      }
    }));
  };

  const clearScan = () => {
    setScanResult(null);
    setError(null);
    try {
      sessionStorage.removeItem('roast_last_scan');
    } catch (e) {}
  };

  return (
    <ScanContext.Provider
      value={{
        scanResult,
        setScanResult,
        isLoading,
        setIsLoading,
        error,
        setError,
        intensity,
        setIntensity,
        recruiterMode,
        setRecruiterMode,
        updateRoast,
        clearScan
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
