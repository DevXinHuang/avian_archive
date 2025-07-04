import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainContent from './Layout/MainContent';
import BirdingHeatmap from './BirdingHeatmap';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import './Journal.css';

/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 * @typedef {import('../types/PhotoSighting').DatabaseResponse} DatabaseResponse
 */

const Journal = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { 
    searchTerm,
    setSearchTerm,
    searchResults: sightings,
    isLoading,
    error,
    clearSearch
  } = useSearch();
  const [expandedDays, setExpandedDays] = useState(new Set());

  // Navigate to species detail view
  const navigateToSpecies = (speciesName) => {
    if (speciesName) {
      navigate(`/gallery/species/${encodeURIComponent(speciesName)}`);
    }
  };

  // Reset filters
  const resetFilters = () => {
    clearSearch();
    setExpandedDays(new Set());
  };

  // Group sightings by day and sort by datetime descending
  const groupedSightings = React.useMemo(() => {
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

  // Expand all days
  const expandAll = () => {
    const allDays = new Set(groupedSightings.map(([dayKey]) => dayKey));
    setExpandedDays(allDays);
  };

  // Collapse all days
  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  // Toggle day expansion (fix for missing function)
  const toggleDay = (dayKey) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
    }
    setExpandedDays(newExpanded);
  };

  // Add search input to header
  const headerActions = (
    <div className="flex gap-4 items-center">
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder={t('sidebar.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="search-clear"
            onClick={resetFilters}
            title={t('sidebar.clearSearch')}
          >
            ×
          </button>
        )}
      </div>
      <button onClick={expandAll} className="btn btn-sm">
        📖 {t('journal.expandAll')}
      </button>
      <button onClick={collapseAll} className="btn btn-sm">
        📕 {t('journal.collapseAll')}
      </button>
    </div>
  );

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
          <button onClick={resetFilters} className="btn btn-primary">
            {t('gallery.clearFilters')}
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
                          <span 
                            className="journal-species clickable-species"
                            onClick={() => navigateToSpecies(sighting.species)}
                            title={t('gallery.clickToViewSpecies')}
                          >
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