import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './BirdingHeatmap.css';

const BirdingHeatmap = ({ sightings = [] }) => {
  const { t } = useLanguage();
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showTestData, setShowTestData] = useState(false);
  const [debugInfo, setDebugInfo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Log component rendering for debugging
  console.log('BirdingHeatmap rendering with sightings:', sightings.length, sightings);

  // Generate test data for demonstration
  const generateTestData = () => {
    const testSightings = [];
    const currentYear = new Date().getFullYear();
    
    // Generate random sightings throughout the year
    for (let month = 0; month < 12; month++) {
      for (let week = 0; week < 4; week++) {
        // Random chance of having sightings each week
        if (Math.random() > 0.3) {
          const day = Math.floor(Math.random() * 7) + (week * 7) + 1;
          const maxDay = new Date(currentYear, month + 1, 0).getDate();
          
          if (day <= maxDay) {
            const numSightings = Math.floor(Math.random() * 8) + 1; // 1-8 sightings
            
            for (let i = 0; i < numSightings; i++) {
              testSightings.push({
                id: `test-${month}-${day}-${i}`,
                datetime: new Date(currentYear, month, day, Math.floor(Math.random() * 12) + 8).toISOString(),
                species: ['Robin', 'Cardinal', 'Blue Jay', 'Sparrow', 'Hawk', 'Eagle'][Math.floor(Math.random() * 6)],
                notes: 'Test sighting data'
              });
            }
          }
        }
      }
    }
    
    return testSightings;
  };

  // Use test data if enabled, otherwise use real sightings
  const displaySightings = showTestData ? generateTestData() : sightings;

  // Generate all days for the selected year
  const yearData = useMemo(() => {
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const days = [];
    
    // Start from the Sunday before the first day of the year
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());
    
    const currentDate = new Date(firstSunday);
    
    while (currentDate <= endDate || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [selectedYear]);

  // Count sightings per day
  const sightingCounts = useMemo(() => {
    const counts = {};
    
    displaySightings.forEach(sighting => {
      if (sighting.datetime) {
        const date = new Date(sighting.datetime);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      }
    });
    
    if (debugInfo) {
      console.log('Sighting Counts:', counts);
      console.log('Total displaySightings:', displaySightings.length);
    }
    
    return counts;
  }, [displaySightings, debugInfo]);

  // Get color intensity based on sighting count
  const getIntensity = (count) => {
    if (count === 0) return 'empty';
    if (count === 1) return 'low';
    if (count <= 3) return 'medium';
    if (count <= 6) return 'high';
    return 'highest';
  };

  // Get sighting count for a specific day
  const getSightingCount = (date) => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return sightingCounts[dateKey] || 0;
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get total stats for the year
  const yearStats = useMemo(() => {
    const totalSightings = Object.values(sightingCounts).reduce((sum, count) => sum + count, 0);
    const activeDays = Object.values(sightingCounts).filter(count => count > 0).length;
    const maxDay = Math.max(...Object.values(sightingCounts), 0);
    
    return { totalSightings, activeDays, maxDay };
  }, [sightingCounts]);

  // Get available years from sightings
  const availableYears = useMemo(() => {
    const years = new Set();
    displaySightings.forEach(sighting => {
      if (sighting.datetime) {
        years.add(new Date(sighting.datetime).getFullYear());
      }
    });
    // Always include current year
    years.add(new Date().getFullYear());
    return Array.from(years).sort().reverse();
  }, [displaySightings]);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Add error boundary and debugging
  if (!sightings) {
    console.error('BirdingHeatmap: sightings prop is undefined');
    return <div>Error: No sightings data provided</div>;
  }

  return (
    <div className="birding-heatmap">
      <div className="heatmap-header">
        <div className="heatmap-title">
          <h3>🗓️ {t('journal.activityMap') || 'Birding Activity'}</h3>
          <p className="heatmap-subtitle">
            {t('journal.activityMapDesc') || 'Your birding activity throughout the year'}
          </p>
        </div>
        
        <div className="heatmap-controls">
          {availableYears.length > 1 && (
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="year-selector"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
          
          {/* Test Controls */}
          <div className="test-controls">
            <button
              onClick={() => setShowTestData(!showTestData)}
              className={`test-btn ${showTestData ? 'active' : ''}`}
              title="Toggle test data to see how the heatmap looks with sample sightings"
            >
              {showTestData ? '🔄 Real Data' : '🧪 Test Data'}
            </button>
            <button
              onClick={() => setDebugInfo(!debugInfo)}
              className={`debug-btn ${debugInfo ? 'active' : ''}`}
              title="Show debug information in console"
            >
              🐛 Debug
            </button>
          </div>
        </div>
      </div>

      <div className="heatmap-stats">
        <div className="stat-item">
          <span className="stat-number">{yearStats.totalSightings}</span>
          <span className="stat-label">{t('journal.totalSightings') || 'Total Sightings'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{yearStats.activeDays}</span>
          <span className="stat-label">{t('journal.activeDays') || 'Active Days'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{yearStats.maxDay}</span>
          <span className="stat-label">{t('journal.maxDay') || 'Best Day'}</span>
        </div>
        {showTestData && (
          <div className="stat-item test-mode-indicator">
            <span className="stat-number">🧪</span>
            <span className="stat-label">Test Mode</span>
          </div>
        )}
      </div>

      {debugInfo && (
        <div className="debug-panel">
          <h4>🐛 Debug Information</h4>
          <p><strong>Data Source:</strong> {showTestData ? 'Test Data' : 'Real Data'}</p>
          <p><strong>Total Sightings:</strong> {displaySightings.length}</p>
          <p><strong>Raw Sightings:</strong> {sightings.length}</p>
          <p><strong>Selected Year:</strong> {selectedYear}</p>
          <p><strong>Unique Days with Data:</strong> {Object.keys(sightingCounts).length}</p>
          <p><strong>Available Years:</strong> {availableYears.join(', ')}</p>
          <p><strong>Sample Sighting:</strong> {displaySightings.length > 0 ? JSON.stringify(displaySightings[0], null, 2) : 'None'}</p>
          <p><strong>Sighting Counts Sample:</strong> {JSON.stringify(Object.entries(sightingCounts).slice(0, 3), null, 2)}</p>
        </div>
      )}

      <div className="heatmap-container">
        <div className="heatmap-months">
          {months.map((month, index) => (
            <div key={month} className="month-label">
              {month}
            </div>
          ))}
        </div>
        
        <div className="heatmap-content">
          <div className="heatmap-weekdays">
            {weekdays.map((day, index) => (
              <div key={day} className={`weekday-label ${index % 2 === 1 ? 'hidden' : ''}`}>
                {day}
              </div>
            ))}
          </div>
          
          <div className="heatmap-grid">
            {Array.from({ length: 53 }, (_, weekIndex) => (
              <div key={weekIndex} className="heatmap-week">
                {Array.from({ length: 7 }, (_, weekDayIndex) => {
                  const dayIndex = weekIndex * 7 + weekDayIndex;
                  const date = yearData[dayIndex];
                  
                  if (!date || date.getFullYear() !== selectedYear) {
                    return <div key={dayIndex} className="heatmap-day empty" />;
                  }
                  
                  const count = getSightingCount(date);
                  const intensity = getIntensity(count);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`heatmap-day ${intensity} ${isToday ? 'today' : ''}`}
                      onMouseEnter={(e) => {
                        setHoveredDay({ date, count });
                        setMousePosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => {
                        setMousePosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={`${formatDate(date)}: ${count} ${count === 1 ? 'sighting' : 'sightings'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="heatmap-legend">
        <span className="legend-label">{t('journal.less') || 'Less'}</span>
        <div className="legend-squares">
          {['empty', 'low', 'medium', 'high', 'highest'].map(level => (
            <div key={level} className={`legend-square ${level}`} />
          ))}
        </div>
        <span className="legend-label">{t('journal.more') || 'More'}</span>
      </div>

      {/* Empty State */}
      {!showTestData && displaySightings.length === 0 && (
        <div className="heatmap-empty-state">
          <div className="empty-icon">📊</div>
          <h4>No Birding Data Yet</h4>
          <p>Import some photos with dates to see your activity heatmap!</p>
          <button onClick={() => setShowTestData(true)} className="test-btn">
            🧪 Try Test Data
          </button>
        </div>
      )}

      {hoveredDay && (
        <div 
          className="heatmap-tooltip"
          style={{
            left: mousePosition.x,
            top: mousePosition.y - 10
          }}
        >
          <div className="tooltip-date">{formatDate(hoveredDay.date)}</div>
          <div className="tooltip-count">
            {hoveredDay.count} {hoveredDay.count === 1 ? 
              (t('journal.sighting') || 'sighting') : 
              (t('journal.sightings') || 'sightings')
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default BirdingHeatmap; 