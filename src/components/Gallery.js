import React, { useState, useEffect, useMemo } from 'react';
import './Gallery.css';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const Gallery = () => {
  /** @type {[PhotoSighting[], React.Dispatch<React.SetStateAction<PhotoSighting[]>>]} */
  const [sightings, setSightings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Check if we're in Electron or browser with better detection
  useEffect(() => {
    const checkElectron = () => {
      const hasElectronAPI = !!window.electronAPI;
      console.log('Gallery: Checking Electron API...', hasElectronAPI);
      setIsElectron(hasElectronAPI);
      
      if (hasElectronAPI && window.electronAPI.database) {
        console.log('Gallery: Electron API and database available');
      } else if (hasElectronAPI) {
        console.log('Gallery: Electron API available but database missing');
      } else {
        console.log('Gallery: Using browser mode (localStorage)');
      }
      
      return hasElectronAPI;
    };
    
    // Initial check
    const initialCheck = checkElectron();
    
    // If not found initially, keep checking for up to 3 seconds
    if (!initialCheck) {
      let attempts = 0;
      const maxAttempts = 6;
      const interval = setInterval(() => {
        attempts++;
        const found = checkElectron();
        
        if (found || attempts >= maxAttempts) {
          clearInterval(interval);
          if (!found) {
            console.log('Gallery: Electron API not found after 3 seconds, using browser mode');
          }
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, []);

  // Mock database for browser testing
  const mockDatabase = {
    /**
     * Get all sightings from localStorage
     * @returns {Promise<DatabaseResponse>} Database response with sightings array
     */
    getAllSightings: () => {
      console.log('Gallery: Using mock database (localStorage)');
      /** @type {PhotoSighting[]} */
      const mockSightings = JSON.parse(localStorage.getItem('mockSightings') || '[]');
      console.log('Gallery: Mock sightings loaded:', mockSightings.length);
      return Promise.resolve({ success: true, data: mockSightings.reverse() });
    }
  };

  const getDB = () => {
    if (isElectron && window.electronAPI && window.electronAPI.database) {
      console.log('Gallery: Using Electron SQLite database');
      return window.electronAPI.database;
    }
    console.log('Gallery: Using mock database');
    return mockDatabase;
  };

  // Load all sightings from database
  const loadSightings = async () => {
    console.log('Gallery: Loading sightings...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Wait a moment to ensure Electron API is ready
      if (isElectron) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const db = getDB();
      console.log('Gallery: Got database instance, calling getAllSightings...');
      
      const result = await db.getAllSightings();
      console.log('Gallery: Database result:', result);
      
      if (result && result.success) {
        setSightings(result.data || []);
        console.log(`Gallery: Loaded ${result.data?.length || 0} sightings`);
      } else {
        const errorMsg = result?.error || 'Unknown database error';
        console.error('Gallery: Database error:', errorMsg);
        setError(`Failed to load sightings: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Gallery: Exception loading sightings:', err);
      setError(`Error loading sightings: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sightings when component mounts or when database environment changes
  useEffect(() => {
    // Add a small delay to ensure everything is initialized
    const timeoutId = setTimeout(() => {
      loadSightings();
    }, isElectron ? 500 : 100);
    
    return () => clearTimeout(timeoutId);
  }, [isElectron]);

  // Filter sightings based on search criteria
  const filteredSightings = useMemo(() => {
    return sightings.filter(sighting => {
      // Species filter (case-insensitive)
      const matchesSpecies = !searchTerm || 
        (sighting.species && sighting.species.toLowerCase().includes(searchTerm.toLowerCase()));

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
            end.setHours(23, 59, 59, 999); // Include the entire end date
            matchesDateRange = matchesDateRange && sightingDate <= end;
          }
        } else if (startDate || endDate) {
          // If we have date filters but no sighting date, exclude this sighting
          matchesDateRange = false;
        }
      }

      // Location filter (search in notes and coordinates)
      const matchesLocation = !locationFilter || 
        (sighting.notes && sighting.notes.toLowerCase().includes(locationFilter.toLowerCase())) ||
        (sighting.latitude && sighting.latitude.toString().includes(locationFilter)) ||
        (sighting.longitude && sighting.longitude.toString().includes(locationFilter));

      return matchesSpecies && matchesDateRange && matchesLocation;
    });
  }, [sightings, searchTerm, startDate, endDate, locationFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setLocationFilter('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Format location for display
  const formatLocation = (latitude, longitude) => {
    if (!latitude || !longitude) return 'No location';
    return `${parseFloat(latitude).toFixed(4)}, ${parseFloat(longitude).toFixed(4)}`;
  };

  // Get placeholder image for missing photos
  const getPhotoDisplay = (sighting) => {
    // In a real app, you might have actual photo URLs or file paths
    // For now, we'll show a placeholder with photo info
    return (
      <div className="photo-placeholder">
        <div className="photo-icon">📸</div>
        <div className="photo-filename">{sighting.filePath || 'No file'}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="gallery-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading sightings...</p>
          <small style={{ color: '#666', marginTop: '0.5rem' }}>
            Using {isElectron ? 'SQLite (Electron)' : 'Mock (Browser)'} database
          </small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-container">
        <div className="error-state">
          <h2>Error Loading Gallery</h2>
          <p>{error}</p>
          <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <strong>Debug Info:</strong>
            <br />
            <small>
              Environment: {isElectron ? 'Electron' : 'Browser'}<br />
              Electron API: {window.electronAPI ? 'Available' : 'Not Available'}<br />
              Database API: {window.electronAPI?.database ? 'Available' : 'Not Available'}
            </small>
          </div>
          <button onClick={loadSightings} className="retry-btn">
            Try Again
          </button>
          {!isElectron && (
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              💡 If you're in the Electron app, try refreshing the page or switching to browser mode.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Bird Sightings Gallery</h2>
        <p>Browse and search your birding observations</p>
        
        {/* Database Environment Info */}
        <div className="database-info">
          <small>
            📊 Database: {isElectron ? 'SQLite (Electron)' : 'Mock (Browser)'} • 
            {sightings.length} total sighting{sightings.length !== 1 ? 's' : ''}
          </small>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="filters-section">
        <div className="filters-row">
          {/* Species Search */}
          <div className="filter-group">
            <label htmlFor="species-search">Species Search:</label>
            <input
              id="species-search"
              type="text"
              placeholder="Search by species name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Date Range */}
          <div className="filter-group">
            <label htmlFor="start-date">Date Range:</label>
            <div className="date-range">
              <input
                id="start-date"
                type="date"
                placeholder="Start date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="filter-input date-input"
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                placeholder="End date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="filter-input date-input"
              />
            </div>
          </div>

          {/* Location Filter */}
          <div className="filter-group">
            <label htmlFor="location-search">Location:</label>
            <input
              id="location-search"
              type="text"
              placeholder="Search notes or coordinates..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Clear Filters */}
          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
            <button onClick={loadSightings} className="refresh-btn">
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Results Summary */}
        <div className="filter-summary">
          Showing {filteredSightings.length} of {sightings.length} sighting{filteredSightings.length !== 1 ? 's' : ''}
          {(searchTerm || startDate || endDate || locationFilter) && (
            <span className="active-filters">
              {searchTerm && <span className="filter-tag">Species: "{searchTerm}"</span>}
              {(startDate || endDate) && (
                <span className="filter-tag">
                  Date: {startDate || '...'} to {endDate || '...'}
                </span>
              )}
              {locationFilter && <span className="filter-tag">Location: "{locationFilter}"</span>}
            </span>
          )}
        </div>
      </div>

      {/* Sightings Grid */}
      {filteredSightings.length === 0 ? (
        <div className="empty-state">
          {sightings.length === 0 ? (
            <>
              <div className="empty-icon">🦅</div>
              <h3>No Sightings Yet</h3>
              <p>Import some photos and add metadata to see them here!</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="import-link-btn"
              >
                Go to Import
              </button>
            </>
          ) : (
            <>
              <div className="empty-icon">🔍</div>
              <h3>No Sightings Match Your Filters</h3>
              <p>Try adjusting your search criteria or clearing filters.</p>
            </>
          )}
        </div>
      ) : (
        <div className="sightings-grid">
          {filteredSightings.map((sighting) => (
            <div key={sighting.id} className="sighting-card">
              {/* Photo Display */}
              <div className="sighting-photo">
                {getPhotoDisplay(sighting)}
              </div>

              {/* Sighting Information */}
              <div className="sighting-info">
                {/* Species */}
                <div className="sighting-species">
                  <h3>{sighting.species || 'Unknown Species'}</h3>
                </div>

                {/* Date and Time */}
                <div className="sighting-datetime">
                  <span className="datetime-icon">📅</span>
                  <span>{formatDate(sighting.datetime)}</span>
                </div>

                {/* Location */}
                {(sighting.latitude || sighting.longitude) && (
                  <div className="sighting-location">
                    <span className="location-icon">📍</span>
                    <span>{formatLocation(sighting.latitude, sighting.longitude)}</span>
                  </div>
                )}

                {/* Notes */}
                {sighting.notes && (
                  <div className="sighting-notes">
                    <span className="notes-icon">📝</span>
                    <p>{sighting.notes}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="sighting-metadata">
                  <small>
                    ID: {sighting.id} • 
                    Added: {new Date(sighting.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery; 