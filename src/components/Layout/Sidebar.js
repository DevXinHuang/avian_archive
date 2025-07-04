import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSearch } from '../../context/SearchContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { 
    searchTerm, 
    setSearchTerm, 
    searchStats, 
    clearSearch,
    searchResults 
  } = useSearch();

  // Navigate to species detail view when a species is found
  React.useEffect(() => {
    if (searchTerm && searchResults.length === 1 && searchResults[0].species) {
      navigate(`/gallery/species/${encodeURIComponent(searchResults[0].species)}`);
    }
  }, [searchResults, searchTerm, navigate]);

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

      {/* Search Function */}
      <div className="sidebar-search">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={t('sidebar.searchPlaceholder') || 'Search species, notes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="search-clear"
              onClick={clearSearch}
              title={t('sidebar.clearSearch') || 'Clear search'}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats - Smaller */}
      <div className="sidebar-stats compact">
        <div className="stats-row">
          <div className="stat-item-compact">
            <span className="stat-icon">📸</span>
            <span className="stat-number">
              {searchStats.isFiltering ? searchStats.filtered : searchStats.total}
            </span>
            <span className="stat-label">{t('common.photos').toUpperCase()}</span>
          </div>
          <div className="stat-item-compact">
            <span className="stat-icon">🐦</span>
            <span className="stat-number">{searchStats.uniqueSpeciesCount}</span>
            <span className="stat-label">{t('common.species').toUpperCase()}</span>
          </div>
        </div>
        {searchStats.isFiltering && (
          <div className="search-indicator">
            <span className="search-status">
              🔍 {searchStats.filtered} {t('sidebar.of') || 'of'} {searchStats.total} {t('common.photos').toLowerCase()}
            </span>
          </div>
        )}
      </div>

      {/* User Login Placeholder */}
      <div className="sidebar-user">
        <div className="user-profile">
          <div className="user-avatar">
            <span className="avatar-placeholder">👤</span>
          </div>
          <div className="user-info">
            <div className="user-name">{t('sidebar.guestUser') || 'Guest User'}</div>
            <div className="user-status">{t('sidebar.offlineMode') || 'Offline Mode'}</div>
          </div>
          <button className="login-btn" title={t('sidebar.loginTooltip') || 'Login (Coming Soon)'}>
            <span className="login-icon">🔐</span>
          </button>
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