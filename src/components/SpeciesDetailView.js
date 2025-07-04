import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainContent from './Layout/MainContent';
import { useLanguage } from '../context/LanguageContext';
import { ensureTestData } from '../utils/testData';
import './SpeciesDetailView.css';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const SpeciesDetailView = () => {
  const { species: speciesParam } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  /** @type {[PhotoSighting[], React.Dispatch<React.SetStateAction<PhotoSighting[]>>]} */
  const [allSightings, setAllSightings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'timeline', 'map'
  const [showStats, setShowStats] = useState(true);
  const [showSpeciesInfo, setShowSpeciesInfo] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Decode species name from URL
  const speciesName = decodeURIComponent(speciesParam || '');

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
      const interval = setInterval(() => {
        attempts++;
        const found = checkElectron();
        if (found || attempts >= 6) {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  // Mock database for browser testing
  const mockDatabase = {
    getAllSightings: () => {
      const mockSightings = JSON.parse(localStorage.getItem('mockSightings') || '[]');
      return Promise.resolve({ success: true, data: mockSightings });
    }
  };

  const getDB = () => {
    if (isElectron && window.electronAPI && window.electronAPI.database) {
      return window.electronAPI.database;
    }
    return mockDatabase;
  };

  // Load all sightings and filter for this species
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
        
        if (loadedSightings.length === 0 && !isElectron) {
          const testSightings = ensureTestData();
          setAllSightings(testSightings);
        } else {
          setAllSightings(loadedSightings);
        }
      } else {
        setError(result?.error || 'Unknown database error');
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

  // Filter sightings for this species
  const speciesSightings = useMemo(() => {
    return allSightings.filter(sighting => 
      sighting.species && sighting.species.toLowerCase() === speciesName.toLowerCase()
    ).sort((a, b) => {
      const dateA = a.datetime ? new Date(a.datetime) : new Date(0);
      const dateB = b.datetime ? new Date(b.datetime) : new Date(0);
      return dateB - dateA; // Most recent first
    });
  }, [allSightings, speciesName]);

  // Calculate species statistics
  const speciesStats = useMemo(() => {
    if (speciesSightings.length === 0) {
      return {
        totalSightings: 0,
        firstSeen: null,
        lastSeen: null,
        totalLocations: 0,
        averagePerMonth: 0,
        mostActiveLocation: null,
        bestPhoto: null
      };
    }

    const dates = speciesSightings
      .map(s => s.datetime ? new Date(s.datetime) : null)
      .filter(Boolean)
      .sort((a, b) => a - b);

    const locations = speciesSightings
      .filter(s => s.latitude && s.longitude)
      .map(s => `${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`);

    const uniqueLocations = [...new Set(locations)];

    // Calculate average per month
    const monthSpan = dates.length > 1 ? 
      (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24 * 30) : 1;
    const averagePerMonth = monthSpan > 0 ? speciesSightings.length / monthSpan : speciesSightings.length;

    return {
      totalSightings: speciesSightings.length,
      firstSeen: dates.length > 0 ? dates[0] : null,
      lastSeen: dates.length > 0 ? dates[dates.length - 1] : null,
      totalLocations: uniqueLocations.length,
      averagePerMonth: Math.round(averagePerMonth * 10) / 10,
      mostActiveLocation: uniqueLocations.length > 0 ? uniqueLocations[0] : null,
      bestPhoto: speciesSightings[0] // Most recent as "best"
    };
  }, [speciesSightings]);

  // Group sightings by month for timeline
  const timelineGroups = useMemo(() => {
    const groups = {};
    
    speciesSightings.forEach(sighting => {
      const date = sighting.datetime ? new Date(sighting.datetime) : null;
      if (date) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(sighting);
      }
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, sightings]) => ({ month, sightings }));
  }, [speciesSightings]);

  // Photo selection handlers
  const togglePhotoSelection = (sightingId) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(sightingId)) {
      newSelection.delete(sightingId);
    } else {
      newSelection.add(sightingId);
    }
    setSelectedPhotos(newSelection);
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(new Set(speciesSightings.map(s => s.id)));
  };

  const clearSelection = () => {
    setSelectedPhotos(new Set());
  };

  // Export functionality
  const exportSpeciesData = () => {
    const dataToExport = {
      species: speciesName,
      statistics: speciesStats,
      sightings: speciesSightings,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${speciesName.replace(/\s+/g, '_')}_sightings.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return t('species.noDate') || 'No date';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long'
    }).format(date);
  };

  // Get species information (this could be enhanced with a real bird API)
  const getSpeciesInfo = (speciesName) => {
    // Mock species data - in a real app, this would come from an API
    const speciesDatabase = {
      'Northern Cardinal': {
        scientificName: 'Cardinalis cardinalis',
        family: 'Cardinalidae',
        habitat: 'Woodlands, gardens, shrublands, wetlands',
        diet: 'Seeds, grains, fruits',
        size: '21-23 cm',
        wingspan: '25-31 cm',
        conservation: 'Least Concern',
        description: 'A vibrant songbird, the male Northern Cardinal is brilliant red with a black face mask around the bill. The female is warm reddish tinged brown. Both have a distinctive crest and thick orange-red bill.'
      },
      'American Robin': {
        scientificName: 'Turdus migratorius',
        family: 'Turdidae',
        habitat: 'Lawns, parks, woodlands',
        diet: 'Worms, insects, fruits',
        size: '20-28 cm',
        wingspan: '31-40 cm',
        conservation: 'Least Concern',
        description: 'A large, round songbird with a large yellow bill, blackish head, and brick-red breast. Often seen hopping across lawns searching for earthworms.'
      }
    };
    
    return speciesDatabase[speciesName] || {
      scientificName: t('species.unknownScientific') || 'Scientific name unknown',
      family: t('species.unknownFamily') || 'Family unknown',
      habitat: t('species.unknownHabitat') || 'Habitat information not available',
      diet: t('species.unknownDiet') || 'Diet information not available',
      size: t('species.unknownSize') || 'Size unknown',
      wingspan: t('species.unknownWingspan') || 'Wingspan unknown',
      conservation: t('species.unknownConservation') || 'Conservation status unknown',
      description: t('species.unknownDescription') || 'No description available for this species.'
    };
  };

  const speciesInfo = getSpeciesInfo(speciesName);

  // Handle photo click for detailed view
  const handlePhotoClick = (sighting) => {
    setSelectedPhoto(sighting);
  };

  // Close photo modal
  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  // Header actions
  const headerActions = (
    <div className="species-header-actions">
      <button onClick={() => navigate('/gallery')} className="btn btn-sm">
        ← {t('species.backToGallery') || 'Back to Gallery'}
      </button>
      <div className="view-mode-controls">
        <button 
          onClick={() => setViewMode('grid')}
          className={`btn btn-sm ${viewMode === 'grid' ? 'active' : ''}`}
        >
          📷 {t('species.gridView') || 'Grid'}
        </button>
        <button 
          onClick={() => setViewMode('timeline')}
          className={`btn btn-sm ${viewMode === 'timeline' ? 'active' : ''}`}
        >
          📅 {t('species.timelineView') || 'Timeline'}
        </button>
      </div>
      <div className="action-buttons">
        {selectedPhotos.size > 0 && (
          <button onClick={exportSpeciesData} className="btn btn-sm btn-primary">
            📤 {t('species.export') || 'Export'} ({selectedPhotos.size})
          </button>
        )}
        <button onClick={exportSpeciesData} className="btn btn-sm">
          💾 {t('species.exportAll') || 'Export All'}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <MainContent title={t('species.loading') || 'Loading Species...'} subtitle="" actions={headerActions}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('species.loadingData') || 'Loading species data...'}</p>
        </div>
      </MainContent>
    );
  }

  if (error) {
    return (
      <MainContent title={t('species.error') || 'Error'} subtitle="" actions={headerActions}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>{t('species.errorLoading') || 'Error loading species data'}</h3>
          <p>{error}</p>
          <button onClick={loadSightings} className="btn btn-primary">
            {t('common.tryAgain') || 'Try Again'}
          </button>
        </div>
      </MainContent>
    );
  }

  if (speciesSightings.length === 0) {
    return (
      <MainContent title={speciesName} subtitle={t('species.noSightings') || 'No sightings found'} actions={headerActions}>
        <div className="empty-state">
          <div className="empty-state-icon">🐦</div>
          <h3>{t('species.noSightingsTitle') || 'No sightings of this species'}</h3>
          <p>{t('species.noSightingsDesc') || 'No photos found for this bird species.'}</p>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent 
      title={speciesName} 
      subtitle={`${speciesSightings.length} ${t('species.sightingsCount') || 'sightings'} • ${speciesStats.totalLocations} ${t('species.locations') || 'locations'}`}
      actions={headerActions}
    >
      <div className="species-detail-view">
        {/* Statistics Panel */}
        {showStats && (
          <div className="species-stats-panel">
            <h4>📊 {t('species.statistics') || 'Statistics'}</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{speciesStats.totalSightings}</div>
                <div className="stat-label">{t('species.totalSightings') || 'Total Sightings'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{speciesStats.totalLocations}</div>
                <div className="stat-label">{t('species.locations') || 'Locations'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{speciesStats.averagePerMonth}</div>
                <div className="stat-label">{t('species.perMonth') || 'Per Month'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-date">{formatDate(speciesStats.firstSeen)}</div>
                <div className="stat-label">{t('species.firstSeen') || 'First Seen'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-date">{formatDate(speciesStats.lastSeen)}</div>
                <div className="stat-label">{t('species.lastSeen') || 'Last Seen'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Species Information Panel */}
        {showSpeciesInfo && (
          <div className="species-info-panel">
            <h4>🐦 {t('species.information') || 'Species Information'}</h4>
            <div className="species-info-grid">
              <div className="info-card">
                <div className="info-label">{t('species.scientificName') || 'Scientific Name'}</div>
                <div className="info-value">{speciesInfo.scientificName}</div>
              </div>
              <div className="info-card">
                <div className="info-label">{t('species.family') || 'Family'}</div>
                <div className="info-value">{speciesInfo.family}</div>
              </div>
              <div className="info-card">
                <div className="info-label">{t('species.size') || 'Size'}</div>
                <div className="info-value">{speciesInfo.size}</div>
              </div>
              <div className="info-card">
                <div className="info-label">{t('species.wingspan') || 'Wingspan'}</div>
                <div className="info-value">{speciesInfo.wingspan}</div>
              </div>
              <div className="info-card">
                <div className="info-label">{t('species.habitat') || 'Habitat'}</div>
                <div className="info-value">{speciesInfo.habitat}</div>
              </div>
              <div className="info-card">
                <div className="info-label">{t('species.diet') || 'Diet'}</div>
                <div className="info-value">{speciesInfo.diet}</div>
              </div>
            </div>
            <div className="species-description">
              <h5>{t('species.description') || 'Description'}</h5>
              <p>{speciesInfo.description}</p>
            </div>
          </div>
        )}

        {/* Selection Controls */}
        <div className="selection-controls">
          <div className="selection-info">
            {selectedPhotos.size > 0 ? (
              <span>{selectedPhotos.size} {t('species.selected') || 'selected'}</span>
            ) : (
              <span>{speciesSightings.length} {t('species.photos') || 'photos'}</span>
            )}
          </div>
          <div className="selection-actions">
            <button onClick={selectAllPhotos} className="btn btn-sm">
              {t('species.selectAll') || 'Select All'}
            </button>
            {selectedPhotos.size > 0 && (
              <button onClick={clearSelection} className="btn btn-sm">
                {t('species.clearSelection') || 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'grid' && (
          <div className="species-photo-grid">
            {speciesSightings.map((sighting) => (
              <div 
                key={sighting.id} 
                className={`photo-card ${selectedPhotos.has(sighting.id) ? 'selected' : ''}`}
              >
                <div className="photo-thumbnail" onClick={() => handlePhotoClick(sighting)}>
                  <div className="photo-placeholder">📸</div>
                  <div className="photo-overlay">
                    <button className="view-btn">
                      👁️ {t('gallery.view') || 'View'}
                    </button>
                  </div>
                  <div 
                    className="selection-checkbox"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhotoSelection(sighting.id);
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedPhotos.has(sighting.id)}
                      onChange={() => {}} // Handled by onClick
                    />
                  </div>
                  {selectedPhotos.has(sighting.id) && (
                    <div className="selection-indicator">✓</div>
                  )}
                </div>
                <div className="photo-info">
                  <div className="photo-date">
                    {sighting.datetime ? 
                      new Date(sighting.datetime).toLocaleDateString() : 
                      t('species.noDate') || 'No date'
                    }
                  </div>
                  {(sighting.latitude || sighting.longitude) && (
                    <div className="photo-location">
                      📍 {parseFloat(sighting.latitude || 0).toFixed(3)}, {parseFloat(sighting.longitude || 0).toFixed(3)}
                    </div>
                  )}
                  {sighting.notes && (
                    <div className="photo-notes">{sighting.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="species-timeline">
            {timelineGroups.map(({ month, sightings }) => (
              <div key={month} className="timeline-month">
                <h4 className="timeline-month-header">
                  {formatMonth(month)} ({sightings.length} {t('species.sightings') || 'sightings'})
                </h4>
                <div className="timeline-sightings">
                  {sightings.map((sighting) => (
                    <div key={sighting.id} className="timeline-sighting">
                      <div className="timeline-photo">📸</div>
                      <div className="timeline-details">
                        <div className="timeline-date">
                          {sighting.datetime ? 
                            new Date(sighting.datetime).toLocaleDateString() : 
                            t('species.noDate') || 'No date'
                          }
                        </div>
                        {(sighting.latitude || sighting.longitude) && (
                          <div className="timeline-location">
                            📍 {parseFloat(sighting.latitude || 0).toFixed(3)}, {parseFloat(sighting.longitude || 0).toFixed(3)}
                          </div>
                        )}
                        {sighting.notes && (
                          <div className="timeline-notes">{sighting.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={closePhotoModal}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={closePhotoModal}>
              ×
            </button>
            <div className="modal-photo">
              <div className="modal-photo-placeholder">📸</div>
            </div>
            <div className="modal-info">
              <h3>{selectedPhoto.species || t('gallery.unknownSpecies')}</h3>
              <div className="modal-details">
                <div className="detail-item">
                  <span className="detail-label">{t('species.dateTaken') || 'Date Taken'}:</span>
                  <span className="detail-value">
                    {selectedPhoto.datetime ? 
                      new Date(selectedPhoto.datetime).toLocaleDateString() : 
                      t('species.noDate') || 'No date'
                    }
                  </span>
                </div>
                {(selectedPhoto.latitude || selectedPhoto.longitude) && (
                  <div className="detail-item">
                    <span className="detail-label">{t('species.location') || 'Location'}:</span>
                    <span className="detail-value">
                      📍 {parseFloat(selectedPhoto.latitude || 0).toFixed(4)}, {parseFloat(selectedPhoto.longitude || 0).toFixed(4)}
                    </span>
                  </div>
                )}
                {selectedPhoto.notes && (
                  <div className="detail-item notes-item">
                    <span className="detail-label">{t('species.notes') || 'Notes'}:</span>
                    <span className="detail-value">{selectedPhoto.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainContent>
  );
};

export default SpeciesDetailView; 