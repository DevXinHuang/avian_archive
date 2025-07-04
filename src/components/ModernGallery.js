import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainContent from './Layout/MainContent';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import './ModernGallery.css';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const ModernGallery = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    searchTerm, 
    setSearchTerm,
    searchResults,
    isLoading,
    error,
    activeFilters,
    updateFilter,
    clearSearch,
    uniqueSpecies
  } = useSearch();

  // Local sort state
  const [sortBy, setSortBy] = useState('newest');

  // Sort search results
  const sortedSightings = React.useMemo(() => {
    return [...searchResults].sort((a, b) => {
      const dateA = a.datetime ? new Date(a.datetime) : new Date(0);
      const dateB = b.datetime ? new Date(b.datetime) : new Date(0);

      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'species':
          return (a.species || '').localeCompare(b.species || '');
        default:
          return dateB - dateA;
      }
    });
  }, [searchResults, sortBy]);

  // Reset filters and sort
  const resetFilters = () => {
    clearSearch();
    setSortBy('newest');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return t('gallery.noDate');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return t('gallery.invalidDate');
    }
  };

  // Format location for display
  const formatLocation = (latitude, longitude) => {
    if (!latitude || !longitude) return null;
    return `${parseFloat(latitude).toFixed(2)}, ${parseFloat(longitude).toFixed(2)}`;
  };

  // Navigate to species detail view
  const navigateToSpecies = (speciesName) => {
    if (speciesName) {
      navigate(`/gallery/species/${encodeURIComponent(speciesName)}`);
    }
  };

  // Header actions
  const headerActions = (
    <div className="flex gap-4 items-center">
      <button onClick={resetFilters} className="btn btn-sm">
        {t('gallery.clearFilters')}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <MainContent title={t('gallery.title')} subtitle={t('gallery.subtitle')} actions={headerActions}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('gallery.loading')}</p>
        </div>
      </MainContent>
    );
  }

  if (error) {
    return (
      <MainContent title={t('gallery.title')} subtitle={t('gallery.subtitle')} actions={headerActions}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>{t('gallery.errorLoading')}</h3>
          <p>{error}</p>
          <button onClick={resetFilters} className="btn btn-primary">
            {t('gallery.clearFilters')}
          </button>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent 
      title={t('gallery.title')} 
      subtitle={`${sortedSightings.length} ${t('common.of')} ${searchResults.length} ${t('gallery.photosCount')}`}
      actions={headerActions}
    >
      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          {/* Search */}
          <div className="filter-group">
            <label className="filter-label">{t('gallery.search')}</label>
            <input
              type="text"
              placeholder={t('gallery.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Species Filter */}
          <div className="filter-group">
            <label className="filter-label">{t('common.species')}</label>
            <select
              value={activeFilters.species}
              onChange={(e) => updateFilter('species', e.target.value)}
              className="filter-select"
            >
              <option value="">{t('gallery.allSpecies')}</option>
              {uniqueSpecies.map(species => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="filter-group">
            <label className="filter-label">{t('gallery.startDate')}</label>
            <input
              type="date"
              value={activeFilters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">{t('gallery.endDate')}</label>
            <input
              type="date"
              value={activeFilters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label className="filter-label">{t('gallery.sortBy')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">{t('gallery.newest')}</option>
              <option value="oldest">{t('gallery.oldest')}</option>
              <option value="species">{t('gallery.speciesName')}</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="filter-group">
            <label className="filter-label">{t('gallery.location')}</label>
            <input
              type="text"
              placeholder={t('gallery.locationPlaceholder')}
              value={activeFilters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {sortedSightings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📸</div>
          <h3>{t('gallery.noPhotos')}</h3>
          <p>
            {searchResults.length === 0 
              ? t('gallery.noPhotosDesc')
              : t('gallery.adjustFilters')
            }
          </p>
          {searchResults.length > 0 && (
            <button onClick={resetFilters} className="btn btn-primary">
              {t('gallery.clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <div className="photo-grid">
          {sortedSightings.map((sighting) => (
            <div key={sighting.id} className="photo-card">
              {/* Photo Thumbnail */}
              <div className="photo-thumbnail">
                <div className="photo-placeholder">
                  <span className="photo-icon">📸</span>
                </div>
                <div className="photo-overlay">
                  <button className="view-btn">👁️ {t('gallery.view')}</button>
                </div>
              </div>

              {/* Photo Info */}
              <div className="photo-info">
                <h3 
                  className="photo-species clickable-species" 
                  onClick={() => navigateToSpecies(sighting.species)}
                  title={t('gallery.clickToViewSpecies') || 'Click to view all photos of this species'}
                >
                  {sighting.species || t('gallery.unknownSpecies')}
                </h3>
                
                <div className="photo-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span className="meta-text">{formatDate(sighting.datetime)}</span>
                  </div>
                  
                  {formatLocation(sighting.latitude, sighting.longitude) && (
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span className="meta-text">{formatLocation(sighting.latitude, sighting.longitude)}</span>
                    </div>
                  )}
                </div>

                {sighting.notes && (
                  <p className="photo-notes">{sighting.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </MainContent>
  );
};

export default ModernGallery; 