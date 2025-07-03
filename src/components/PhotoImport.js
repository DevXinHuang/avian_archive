import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import SpeciesAutocomplete from './SpeciesAutocomplete';
import birdSpeciesData from '../data/bird-species.json';
import { createPhotoSighting, validatePhotoSighting, normalizeCoordinates } from '../types/PhotoSighting';
import './PhotoImport.css';

const PhotoImport = () => {
  const [importedPhotos, setImportedPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Store species data for each photo: { photoId: speciesData }
  const [photoSpecies, setPhotoSpecies] = useState({});
  // Store metadata for each photo: { photoId: { date, latitude, longitude, notes } }
  const [photoMetadata, setPhotoMetadata] = useState({});
  // Store AI suggestions for each photo: { photoId: { species, confidence, isGenerating } }
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResults, setProcessResults] = useState(null);
  const [isElectron, setIsElectron] = useState(false);

  // Check if we're in Electron or browser
  useEffect(() => {
    const checkElectron = () => {
      setIsElectron(!!window.electronAPI);
    };
    checkElectron();
    setTimeout(checkElectron, 1000);
  }, []);

  // Mock database for browser testing
  const mockDatabase = {
    sightings: JSON.parse(localStorage.getItem('mockSightings') || '[]'),
    
    /**
     * Insert a new sighting into localStorage
     * @param {import('../types/PhotoSighting').PhotoSightingInput} data - Sighting data to insert
     * @returns {Promise<import('../types/PhotoSighting').DatabaseResponse>} Database response
     */
    insertSighting: (data) => {
      /** @type {import('../types/PhotoSighting').PhotoSighting} */
      const newSighting = {
        id: Date.now() + Math.random(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDatabase.sightings.push(newSighting);
      localStorage.setItem('mockSightings', JSON.stringify(mockDatabase.sightings));
      return Promise.resolve({ success: true, id: newSighting.id });
    }
  };

  const getDB = () => {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.database;
    }
    return mockDatabase;
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    setIsLoading(true);
    
    const newPhotos = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      path: file.path,
      preview: URL.createObjectURL(file),
      lastModified: new Date(file.lastModified)
    }));

    setImportedPhotos(prev => [...prev, ...newPhotos]);
    setIsLoading(false);
  }, []);

  // Handle file picker
  const handleFilePicker = async () => {
    try {
      const result = await window.electronAPI.showOpenDialog();
      
      if (!result.canceled && result.filePaths.length > 0) {
        setIsLoading(true);
        
        const newPhotos = await Promise.all(
          result.filePaths.map(async (filePath) => {
            const response = await fetch(`file://${filePath}`);
            const blob = await response.blob();
            const file = new File([blob], filePath.split('/').pop(), {
              type: blob.type,
              lastModified: Date.now()
            });
            
            return {
              id: Date.now() + Math.random(),
              file,
              name: file.name,
              size: file.size,
              path: filePath,
              preview: URL.createObjectURL(blob),
              lastModified: new Date()
            };
          })
        );

        setImportedPhotos(prev => [...prev, ...newPhotos]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
      setIsLoading(false);
    }
  };

  // Handle species selection for a photo
  const handleSpeciesChange = (photoId, speciesData) => {
    setPhotoSpecies(prev => ({
      ...prev,
      [photoId]: speciesData
    }));
  };

  // Handle metadata changes for a photo
  const handleMetadataChange = (photoId, field, value) => {
    setPhotoMetadata(prev => ({
      ...prev,
      [photoId]: {
        ...prev[photoId],
        [field]: value
      }
    }));
  };

  // Get current metadata for a photo
  const getPhotoMetadata = (photoId) => {
    return photoMetadata[photoId] || {
      date: '',
      latitude: '',
      longitude: '',
      notes: ''
    };
  };

  /**
   * Process all photos and save to database
   * @returns {Promise<void>}
   */
  const processPhotos = async () => {
    if (importedPhotos.length === 0) {
      alert('No photos to process!');
      return;
    }

    setIsProcessing(true);
    setProcessResults(null);
    
    const db = getDB();
    const results = {
      successful: 0,
      failed: 0,
      errors: [],
      total: importedPhotos.length
    };

    try {
      for (const photo of importedPhotos) {
        try {
          // Get metadata for this photo
          const metadata = getPhotoMetadata(photo.id);
          const species = photoSpecies[photo.id];
          
          // Create PhotoSighting object with proper types
          /** @type {import('../types/PhotoSighting').PhotoSightingInput} */
          const sightingInput = createPhotoSighting({
            filePath: photo.path || photo.name, // Use path if available (Electron), otherwise name
            species: species?.common_name || '', // Get species name if selected
            datetime: metadata.date || '', // ISO datetime string
            ...normalizeCoordinates({
              latitude: metadata.latitude,
              longitude: metadata.longitude
            }),
            notes: metadata.notes || ''
          });

          // Validate the sighting data
          const validation = validatePhotoSighting(sightingInput);
          if (!validation.isValid) {
            results.failed++;
            results.errors.push(`${photo.name}: Validation errors - ${validation.errors.join(', ')}`);
            continue;
          }

          // Insert into database
          const result = await db.insertSighting(sightingInput);
          
          if (result.success) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push(`${photo.name}: ${result.error}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`${photo.name}: ${error.message}`);
        }
      }

      setProcessResults(results);

      // If all successful, optionally clear the imported photos
      if (results.failed === 0) {
        // Uncomment this if you want to clear photos after successful processing
        // clearAllPhotos();
      }

    } catch (error) {
      setProcessResults({
        successful: 0,
        failed: importedPhotos.length,
        errors: [`General error: ${error.message}`],
        total: importedPhotos.length
      });
    }

    setIsProcessing(false);
  };

  // Remove photo from import list
  const removePhoto = (photoId) => {
    setImportedPhotos(prev => {
      const updated = prev.filter(photo => photo.id !== photoId);
      // Clean up URL objects
      const photoToRemove = prev.find(photo => photo.id === photoId);
      if (photoToRemove?.preview) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return updated;
    });
    
    // Remove species data for this photo
    setPhotoSpecies(prev => {
      const { [photoId]: removed, ...rest } = prev;
      return rest;
    });

    // Remove metadata for this photo
    setPhotoMetadata(prev => {
      const { [photoId]: removed, ...rest } = prev;
      return rest;
    });

    // Remove AI suggestions for this photo
    setAiSuggestions(prev => {
      const { [photoId]: removed, ...rest } = prev;
      return rest;
    });
  };

  // Clear all photos
  const clearAllPhotos = () => {
    importedPhotos.forEach(photo => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });
    setImportedPhotos([]);
    setPhotoSpecies({});
    setPhotoMetadata({});
    setAiSuggestions({});
    setProcessResults(null);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // AI Bird Identification Simulation
  const generateAISuggestion = async (photoId) => {
    // Set loading state
    setAiSuggestions(prev => ({
      ...prev,
      [photoId]: { isGenerating: true }
    }));

    // Simulate AI processing time (1-3 seconds)
    const processingTime = 1000 + Math.random() * 2000;
    
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Randomly select a bird species
    const randomIndex = Math.floor(Math.random() * birdSpeciesData.length);
    const selectedSpecies = birdSpeciesData[randomIndex];

    // Generate a realistic confidence score (50-95%)
    const confidence = Math.floor(50 + Math.random() * 45) + Math.random().toFixed(1);

    // Set the suggestion
    setAiSuggestions(prev => ({
      ...prev,
      [photoId]: {
        species: selectedSpecies,
        confidence: parseFloat(confidence),
        isGenerating: false
      }
    }));
  };

  // Use AI suggestion to fill species field
  const useAISuggestion = (photoId) => {
    const suggestion = aiSuggestions[photoId];
    if (suggestion && suggestion.species) {
      handleSpeciesChange(photoId, suggestion.species);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  });

  return (
    <div className="photo-import">
      <div className="import-header">
        <h2>Import Bird Photos</h2>
        <p>Add photos to start building your birding journal</p>
      </div>

      {/* Database Environment Info */}
      {importedPhotos.length > 0 && (
        <div className="database-info">
          <small>
            📊 Database: {isElectron ? 'SQLite (Electron)' : 'Mock (Browser)'}
          </small>
        </div>
      )}

      {/* Dropzone */}
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="dropzone-icon">📸</div>
          {isDragActive ? (
            <p>Drop the photos here...</p>
          ) : (
            <>
              <p>Drag and drop bird photos here</p>
              <p className="dropzone-subtext">or</p>
              <button 
                type="button" 
                className="file-picker-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilePicker();
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Choose Files'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Processing Results */}
      {processResults && (
        <div className={`process-results ${processResults.failed === 0 ? 'success' : 'partial'}`}>
          <h3>Processing Results</h3>
          <div className="results-summary">
            <span className="success">✅ Successful: {processResults.successful}</span>
            <span className="failed">❌ Failed: {processResults.failed}</span>
            <span className="total">📊 Total: {processResults.total}</span>
          </div>
          {processResults.errors.length > 0 && (
            <div className="error-details">
              <h4>Errors:</h4>
              <ul>
                {processResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Imported Photos List */}
      {importedPhotos.length > 0 && (
        <div className="imported-photos">
          <div className="imported-photos-header">
            <h3>Imported Photos ({importedPhotos.length})</h3>
            <button 
              className="clear-all-btn"
              onClick={clearAllPhotos}
              disabled={isProcessing}
            >
              Clear All
            </button>
          </div>

          <div className="photos-grid">
            {importedPhotos.map(photo => {
              const metadata = getPhotoMetadata(photo.id);
              
              return (
                <div key={photo.id} className="photo-card">
                  <div className="photo-preview">
                    <img 
                      src={photo.preview} 
                      alt={photo.name}
                      loading="lazy"
                    />
                    <button 
                      className="remove-photo-btn"
                      onClick={() => removePhoto(photo.id)}
                      aria-label="Remove photo"
                      disabled={isProcessing}
                    >
                      ×
                    </button>
                  </div>
                  <div className="photo-info">
                    <div className="photo-name" title={photo.name}>
                      {photo.name}
                    </div>
                    <div className="photo-details">
                      <span className="photo-size">{formatFileSize(photo.size)}</span>
                      <span className="photo-date">
                        {photo.lastModified.toLocaleDateString()}
                      </span>
                    </div>

                    {/* AI Bird Identification */}
                    <div className="ai-suggestion-section">
                      <div className="ai-suggestion-header">
                        <span className="ai-label">🤖 AI Bird ID</span>
                        <button
                          className="suggest-species-btn"
                          onClick={() => generateAISuggestion(photo.id)}
                          disabled={isProcessing || aiSuggestions[photo.id]?.isGenerating}
                        >
                          {aiSuggestions[photo.id]?.isGenerating ? (
                            <>
                              <span className="loading-spinner">⏳</span>
                              Analyzing...
                            </>
                          ) : (
                            'Suggest Species'
                          )}
                        </button>
                      </div>
                      
                      {aiSuggestions[photo.id] && !aiSuggestions[photo.id].isGenerating && aiSuggestions[photo.id].species && (
                        <div className="ai-suggestion-result">
                          <div className="suggestion-species">
                            <span className="suggestion-name">
                              {aiSuggestions[photo.id].species.common_name}
                            </span>
                            <span className="suggestion-scientific">
                              {aiSuggestions[photo.id].species.scientific_name}
                            </span>
                          </div>
                          <div className="suggestion-confidence">
                            <span className="confidence-label">Confidence:</span>
                            <span className={`confidence-score ${
                              aiSuggestions[photo.id].confidence >= 80 ? 'high' :
                              aiSuggestions[photo.id].confidence >= 60 ? 'medium' : 'low'
                            }`}>
                              {aiSuggestions[photo.id].confidence}%
                            </span>
                          </div>
                          <button
                            className="use-suggestion-btn"
                            onClick={() => useAISuggestion(photo.id)}
                            disabled={isProcessing}
                          >
                            Use Suggestion
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Species Selection */}
                    <div className="species-section">
                      <label className="species-label">Bird Species:</label>
                      <SpeciesAutocomplete
                        value={photoSpecies[photo.id]?.common_name || ''}
                        onChange={(speciesData) => handleSpeciesChange(photo.id, speciesData)}
                        placeholder="Search for bird species..."
                      />
                      {photoSpecies[photo.id] && (
                        <div className="selected-species-info">
                          <span className="selected-species-scientific">
                            {photoSpecies[photo.id].scientific_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Section */}
                    <div className="metadata-section">
                      <h4 className="metadata-title">Photo Details</h4>
                      
                      {/* Date/Time */}
                      <div className="metadata-field">
                        <label className="metadata-label">Date & Time:</label>
                        <input
                          type="datetime-local"
                          value={metadata.date}
                          onChange={(e) => handleMetadataChange(photo.id, 'date', e.target.value)}
                          className="metadata-input datetime-input"
                          disabled={isProcessing}
                        />
                      </div>

                      {/* Location */}
                      <div className="metadata-field">
                        <label className="metadata-label">Location:</label>
                        <div className="location-inputs">
                          <input
                            type="number"
                            step="any"
                            placeholder="Latitude"
                            value={metadata.latitude}
                            onChange={(e) => handleMetadataChange(photo.id, 'latitude', e.target.value)}
                            className="metadata-input location-input"
                            min="-90"
                            max="90"
                            disabled={isProcessing}
                          />
                          <input
                            type="number"
                            step="any"
                            placeholder="Longitude"
                            value={metadata.longitude}
                            onChange={(e) => handleMetadataChange(photo.id, 'longitude', e.target.value)}
                            className="metadata-input location-input"
                            min="-180"
                            max="180"
                            disabled={isProcessing}
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="metadata-field">
                        <label className="metadata-label">Notes:</label>
                        <textarea
                          placeholder="Add any notes about this sighting..."
                          value={metadata.notes}
                          onChange={(e) => handleMetadataChange(photo.id, 'notes', e.target.value)}
                          className="metadata-input notes-input"
                          rows="3"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="import-actions">
            <button 
              className="process-photos-btn"
              onClick={processPhotos}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing Photos...' : `Process Photos (${importedPhotos.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoImport; 