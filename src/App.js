import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import PhotoImport from './components/PhotoImport';
import Gallery from './components/Gallery';
import Journal from './components/Journal';
import DatabaseTest from './components/DatabaseTest';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav-bar">
          <div className="nav-brand">
            <h1>🦅 Birding App</h1>
          </div>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Import
            </NavLink>
            <NavLink to="/gallery" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Gallery
            </NavLink>
            <NavLink to="/journal" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Journal
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<PhotoImport />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/test-db" element={<DatabaseTest />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 