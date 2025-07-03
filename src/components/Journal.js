import React, { useState, useEffect, useMemo } from 'react';
import { ensureTestData } from '../utils/testData';
import './Journal.css';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const Journal = () => {
  /** @type {[PhotoSighting[], React.Dispatch<React.SetStateAction<PhotoSighting[]>>]} */
  const [sightings, setSightings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set());

  // Check if we're in Electron or browser (same logic as Gallery)
  useEffect(() => {
    const checkElectron = () => {
      const hasElectronAPI = !!window.electronAPI;
      console.log('Journal: Checking Electron API...', hasElectronAPI);
      setIsElectron(hasElectronAPI);
      
      if (hasElectronAPI && window.electronAPI.database) {
        console.log('Journal: Electron API and database available');
      } else if (hasElectronAPI) {
        console.log('Journal: Electron API available but database missing');
      } else {
        console.log('Journal: Using browser mode (localStorage)');
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
            console.log('Journal: Electron API not found after 3 seconds, using browser mode');
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
      console.log('Journal: Using mock database (localStorage)');
      /** @type {PhotoSighting[]} */
      const mockSightings = JSON.parse(localStorage.getItem('mockSightings') || '[]');
      console.log('Journal: Mock sightings loaded:', mockSightings.length);
      return Promise.resolve({ success: true, data: mockSightings.reverse() });
    }
  };

  const getDB = () => {
    if (isElectron && window.electronAPI && window.electronAPI.database) {
      console.log('Journal: Using Electron SQLite database');
      return window.electronAPI.database;
    }
    console.log('Journal: Using mock database');
    return mockDatabase;
  };

  // Load all sightings from database (same logic as Gallery)
  const loadSightings = async () => {
    console.log('Journal: Loading sightings...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Wait a moment to ensure Electron API is ready
      if (isElectron) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const db = getDB();
      console.log('Journal: Got database instance, calling getAllSightings...');
      
      const result = await db.getAllSightings();
      console.log('Journal: Database result:', result);
      
      if (result && result.success) {
        const loadedSightings = result.data || [];
        
        // If no sightings exist and we're in browser mode, add test data
        if (loadedSightings.length === 0 && !isElectron) {
          console.log('Journal: No sightings found, adding test data...');
          const testSightings = ensureTestData();
          setSightings(testSightings);
          console.log(`Journal: Added ${testSightings.length} test sightings`);
        } else {
          setSightings(loadedSightings);
          console.log(`Journal: Loaded ${loadedSightings.length} sightings`);
        }
      } else {
        const errorMsg = result?.error || 'Unknown database error';
        console.error('Journal: Database error:', errorMsg);
        setError(`Failed to load sightings: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Journal: Exception loading sightings:', err);
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

  // Group sightings by day and sort by datetime descending
  const groupedSightings = useMemo(() => {
    // First sort all sightings by datetime descending
    const sortedSightings = [...sightings].sort((a, b) => {
      const dateA = a.datetime ? new Date(a.datetime) : new Date(0);
      const dateB = b.datetime ? new Date(b.datetime) : new Date(0);
      return dateB - dateA; // Descending order
    });

    // Group by day (YYYY-MM-DD)
    const groups = {};
    sortedSightings.forEach(sighting => {
      let dayKey;
      if (sighting.datetime) {
        try {
          const date = new Date(sighting.datetime);
          dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        } catch {
          dayKey = 'no-date';
        }
      } else {
        dayKey = 'no-date';
      }

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(sighting);
    });

    // Convert to array and sort days descending
    const sortedGroups = Object.entries(groups).sort(([dayA], [dayB]) => {
      if (dayA === 'no-date') return 1;
      if (dayB === 'no-date') return -1;
      return dayB.localeCompare(dayA); // Descending order
    });

    return sortedGroups;
  }, [sightings]);

  // Toggle day expansion
  const toggleDay = (dayKey) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
    }
    setExpandedDays(newExpanded);
  };

  // Expand all days
  const expandAll = () => {
    const allDays = new Set(groupedSightings.map(([dayKey]) => dayKey));
    setExpandedDays(allDays);
  };

  // Collapse all days
  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  // Format day header
  const formatDayHeader = (dayKey) => {
    if (dayKey === 'no-date') return 'Unknown Date';
    
    try {
      const date = new Date(dayKey + 'T00:00:00');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = date.toDateString() === today.toDateString();
      const isYesterday = date.toDateString() === yesterday.toDateString();
      
      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dayKey;
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return 'No time';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Invalid time';
    }
  };

  // Get placeholder image for missing photos
  const getPhotoDisplay = (sighting) => {
    return (
      <div className="journal-photo-placeholder">
        <div className="journal-photo-icon">📸</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="journal-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading birding journal...</p>
          <small style={{ color: '#666', marginTop: '0.5rem' }}>
            Using {isElectron ? 'SQLite (Electron)' : 'Mock (Browser)'} database
          </small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="journal-container">
        <div className="error-state">
          <h2>Error Loading Journal</h2>
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
        </div>
      </div>
    );
  }

  return (
    <div className="journal-container">
      <div className="journal-header">
        <h2>Birding Journal</h2>
        <p>Your birding diary with sightings organized by day</p>
        
        {/* Database Environment Info */}
        <div className="database-info">
          <small>
            📊 Database: {isElectron ? 'SQLite (Electron)' : 'Mock (Browser)'} • 
            {sightings.length} total sighting{sightings.length !== 1 ? 's' : ''}
          </small>
        </div>
      </div>

      {/* Controls */}
      <div className="journal-controls">
        <div className="expand-controls">
          <button onClick={expandAll} className="expand-btn">
            Expand All
          </button>
          <button onClick={collapseAll} className="expand-btn">
            Collapse All
          </button>
          <button onClick={loadSightings} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {/* Journal Entries */}
      {groupedSightings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <h3>No Journal Entries Yet</h3>
          <p>Import some photos and add metadata to start your birding diary!</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="import-link-btn"
          >
            Go to Import
          </button>
        </div>
      ) : (
        <div className="journal-entries">
          {groupedSightings.map(([dayKey, daySightings]) => (
            <div key={dayKey} className="day-group">
              {/* Day Header */}
              <div 
                className="day-header"
                onClick={() => toggleDay(dayKey)}
              >
                <div className="day-header-content">
                  <h3 className="day-title">{formatDayHeader(dayKey)}</h3>
                  <div className="day-summary">
                    {daySightings.length} sighting{daySightings.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="day-toggle">
                  {expandedDays.has(dayKey) ? '▼' : '▶'}
                </div>
              </div>

              {/* Day Sightings */}
              {expandedDays.has(dayKey) && (
                <div className="day-sightings">
                  {daySightings.map((sighting) => (
                    <div key={sighting.id} className="journal-sighting">
                      {/* Photo Thumbnail */}
                      <div className="journal-photo">
                        {getPhotoDisplay(sighting)}
                      </div>

                      {/* Sighting Details */}
                      <div className="journal-details">
                        {/* Time and Species */}
                        <div className="journal-primary">
                          <span className="journal-time">{formatTime(sighting.datetime)}</span>
                          <span className="journal-species">
                            {sighting.species || 'Unknown Species'}
                          </span>
                        </div>

                        {/* Location */}
                        {(sighting.latitude || sighting.longitude) && (
                          <div className="journal-location">
                            📍 {parseFloat(sighting.latitude || 0).toFixed(4)}, {parseFloat(sighting.longitude || 0).toFixed(4)}
                          </div>
                        )}

                        {/* Notes */}
                        {sighting.notes && (
                          <div className="journal-notes">
                            {sighting.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Journal; 