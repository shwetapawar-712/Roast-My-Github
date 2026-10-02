import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScanProvider } from './context/ScanContext.jsx';
import Landing from './pages/Landing.jsx';
import Scanning from './pages/Scanning.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RepositoryDetail from './pages/RepositoryDetail.jsx';

import Compare from './pages/Compare.jsx';

export default function App() {
  return (
    <ScanProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/scanning" element={<Scanning />} />
          <Route path="/scanning/*" element={<Scanning />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:username/repo/:repo" element={<RepositoryDetail />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ScanProvider>
  );
}
