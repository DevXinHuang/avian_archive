import React, { useState, useEffect, useMemo } from 'react';
import MainContent from './Layout/MainContent';
import BirdingHeatmap from './BirdingHeatmap';
import { useLanguage } from '../context/LanguageContext';
import { ensureTestData } from '../utils/testData';
import './Journal.css';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const Journal = () => {
  const { t } = useLanguage();
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
    if (dayKey === 'no-date') return t('journal.unknownDate');
    
    try {
      const date = new Date(dayKey + 'T00:00:00');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = date.toDateString() === today.toDateString();
      const isYesterday = date.toDateString() === yesterday.toDateString();
      
      if (isToday) return t('journal.today');
      if (isYesterday) return t('journal.yesterday');
      
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
    if (!dateString) return t('journal.noTime');
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return t('journal.invalidTime');
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

  // Header actions
  const headerActions = (
    <div className="flex gap-4 items-center">
      <button onClick={expandAll} className="btn btn-sm">
        📖 {t('journal.expandAll')}
      </button>
      <button onClick={collapseAll} className="btn btn-sm">
        📕 {t('journal.collapseAll')}
      </button>
      <button onClick={loadSightings} className="btn btn-sm">
        🔄 {t('journal.refresh')}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <MainContent title={t('journal.title')} subtitle={t('journal.subtitle')} actions={headerActions}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('journal.loading')}</p>
        </div>
      </MainContent>
    );
  }

  if (error) {
    return (
      <MainContent title={t('journal.title')} subtitle={t('journal.subtitle')} actions={headerActions}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>{t('journal.errorLoading')}</h3>
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
      title={t('journal.title')} 
      subtitle={`${sightings.length} ${t('journal.entriesCount')} ${groupedSightings.length} ${t('journal.days')}`}
      actions={headerActions}
    >
      {/* Debug Section - Should be visible */}
      <div style={{ background: 'yellow', padding: '20px', margin: '20px 0', border: '3px solid orange', borderRadius: '10px' }}>
        <h2>🔧 DEBUG: Journal.js Component Active</h2>
        <p><strong>Sightings count:</strong> {sightings.length}</p>
        <p><strong>Grouped days:</strong> {groupedSightings.length}</p>
        <button 
          onClick={() => console.log('Sightings data:', sightings)}
          style={{ padding: '10px', background: 'white', border: '1px solid black', cursor: 'pointer', marginRight: '10px' }}
        >
          Log Sightings
        </button>
        <button 
          onClick={() => alert('Journal.js is working!')}
          style={{ padding: '10px', background: 'lightgreen', border: '1px solid black', cursor: 'pointer' }}
        >
          Test Alert
        </button>
      </div>

      {/* Birding Activity Heatmap */}
      <BirdingHeatmap sightings={sightings} />

      {/* Journal Entries */}
      {groupedSightings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>{t('journal.noEntries')}</h3>
          <p>{t('journal.noEntriesDesc')}</p>
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
                    {daySightings.length} {daySightings.length === 1 ? t('journal.sighting') : t('journal.sightings')}
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
                            {sighting.species || t('journal.unknownSpecies')}
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
    </MainContent>
  );
};

export default Journal; 