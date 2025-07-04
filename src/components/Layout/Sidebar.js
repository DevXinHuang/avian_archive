import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navigationItems = [
    {
      path: '/gallery',
      icon: '🖼️',
      label: t('gallery'),
      description: t('nav.gallery.desc')
    },
    {
      path: '/journal',
      icon: '📖',
      label: t('journal'),
      description: t('nav.journal.desc')
    },
    {
      path: '/map',
      icon: '🗺️',
      label: t('map'),
      description: t('nav.map.desc')
    },
    {
      path: '/import',
      icon: '📤',
      label: t('import'),
      description: t('nav.import.desc')
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: t('settings'),
      description: t('nav.settings.desc')
    }
  ];

  return (
    <aside className="sidebar">
      {/* App Header */}
      <div className="sidebar-header">
        <div className="app-logo">
          <span className="logo-icon">🦅</span>
          <div className="logo-text">
            <h1>{t('settings.appName')}</h1>
            <p>{t('settings.description')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Stats */}
      <div className="sidebar-stats">
        <div className="stat-item">
          <span className="stat-icon">📸</span>
          <div className="stat-content">
            <span className="stat-number">0</span>
            <span className="stat-label">{t('common.photos')}</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🐦</span>
          <div className="stat-content">
            <span className="stat-number">0</span>
            <span className="stat-label">{t('common.species')}</span>
          </div>
        </div>
      </div>

      {/* Database Test Link (Hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="sidebar-footer">
          <NavLink to="/test-db" className="test-link">
            🧪 Database Test
          </NavLink>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 