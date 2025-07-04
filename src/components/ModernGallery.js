import React, { useState, useEffect, useMemo } from 'react';
import MainContent from './Layout/MainContent';
import { useLanguage } from '../context/LanguageContext';
import { ensureTestData } from '../utils/testData';
import './ModernGallery.css';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const ModernGallery = () => {
  const { t } = useLanguage();
  /** @type {[PhotoSighting[], React.Dispatch<React.SetStateAction<PhotoSighting[]>>]} */
  const [sightings, setSightings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [error, setError] = useState(null);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Check if we're in Electron or browser
  useEffect(() => {
    const checkElectron = () => {
      const hasElectronAPI = !!window.electronAPI;
      setIsElectron(hasElectronAPI);
      return hasElectronAPI;
    };
    
    const initialCheck = checkElectron();
    if (!initialCheck) {
      let attempts = 0;
      const maxAttempts = 6;
      const interval = setInterval(() => {
        attempts++;
        const found = checkElectron();
        
        if (found || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, []);

  // Mock database for browser testing
  const mockDatabase = {
    getAllSightings: () => {
      /** @type {PhotoSighting[]} */
      const mockSightings = JSON.parse(localStorage.getItem('mockSightings') || '[]');
      return Promise.resolve({ success: true, data: mockSightings.reverse() });
    }
  };

  const getDB = () => {
    if (isElectron && window.electronAPI && window.electronAPI.database) {
      return window.electronAPI.database;
    }
    return mockDatabase;
  };

  // Load all sightings from database
  const loadSightings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isElectron) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const db = getDB();
      const result = await db.getAllSightings();
      
      if (result && result.success) {
        const loadedSightings = result.data || [];
        
        // If no sightings exist and we're in browser mode, add test data
        if (loadedSightings.length === 0 && !isElectron) {
          const testSightings = ensureTestData();
          setSightings(testSightings);
        } else {
          setSightings(loadedSightings);
        }
      } else {
        const errorMsg = result?.error || 'Unknown database error';
        setError(`Failed to load sightings: ${errorMsg}`);
      }
    } catch (err) {
      setError(`Error loading sightings: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSightings();
    }, isElectron ? 500 : 100);
    
    return () => clearTimeout(timeoutId);
  }, [isElectron]);

  // Get unique species for filter dropdown
  const uniqueSpecies = useMemo(() => {
    const species = sightings
      .map(s => s.species)
      .filter(s => s && s.trim())
      .filter((species, index, arr) => arr.indexOf(species) === index)
      .sort();
    return species;
  }, [sightings]);

  // Filter and sort sightings
  const filteredAndSortedSightings = useMemo(() => {
    let filtered = sightings.filter(sighting => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (sighting.species && sighting.species.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sighting.notes && sighting.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Species filter
      const matchesSpecies = !selectedSpecies || sighting.species === selectedSpecies;

      // Date range filter
      let matchesDateRange = true;
      if (startDate || endDate) {
        const sightingDate = sighting.datetime ? new Date(sighting.datetime) : null;
        if (sightingDate) {
          if (startDate) {
            const start = new Date(startDate);
            matchesDateRange = matchesDateRange && sightingDate >= start;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDateRange = matchesDateRange && sightingDate <= end;
          }
        } else if (startDate || endDate) {
          matchesDateRange = false;
        }
      }

      return matchesSearch && matchesSpecies && matchesDateRange;
    });

    // Sort results
    filtered.sort((a, b) => {
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

    return filtered;
  }, [sightings, searchTerm, selectedSpecies, startDate, endDate, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecies('');
    setStartDate('');
    setEndDate('');
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

  // Header actions
  const headerActions = (
    <div className="flex gap-4 items-center">
      <button onClick={loadSightings} className="btn btn-sm">
        🔄 {t('gallery.refresh')}
      </button>
      <button onClick={clearFilters} className="btn btn-sm">
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
          <button onClick={loadSightings} className="btn btn-primary">
            {t('common.tryAgain')}
          </button>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent 
      title={t('gallery.title')} 
      subtitle={`${filteredAndSortedSightings.length} ${t('common.of')} ${sightings.length} ${t('gallery.photosCount')}`}
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
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">{t('gallery.endDate')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
        </div>
      </div>

      {/* Photo Grid */}
      {filteredAndSortedSightings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📸</div>
          <h3>{t('gallery.noPhotos')}</h3>
          <p>
            {sightings.length === 0 
              ? t('gallery.noPhotosDesc')
              : t('gallery.adjustFilters')
            }
          </p>
        </div>
      ) : (
        <div className="photo-grid">
          {filteredAndSortedSightings.map((sighting) => (
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
                <h3 className="photo-species">{sighting.species || t('gallery.unknownSpecies')}</h3>
                
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