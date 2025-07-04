import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import Sidebar from './components/Layout/Sidebar';
import PhotoImport from './components/PhotoImport';
import ModernGallery from './components/ModernGallery';
import Journal from './components/Journal';
import Map from './components/Map';
import Settings from './components/Settings';
import DatabaseTest from './components/DatabaseTest';
import SpeciesDetailView from './components/SpeciesDetailView';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SearchProvider>
          <Router>
            <div className="app">
              <Sidebar />
              <Routes>
                {/* Redirect root to gallery as default */}
                <Route path="/" element={<Navigate to="/gallery" replace />} />
                <Route path="/gallery/species/:species" element={<SpeciesDetailView />} />
                <Route path="/gallery" element={<ModernGallery />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/map" element={<Map />} />
                <Route path="/import" element={<PhotoImport />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/test-db" element={<DatabaseTest />} />
              </Routes>
            </div>
          </Router>
        </SearchProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App; 