import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './PhotoImport.css';

const PhotoImport = () => {
  const [importedPhotos, setImportedPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
  };

  // Clear all photos
  const clearAllPhotos = () => {
    importedPhotos.forEach(photo => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });
    setImportedPhotos([]);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

      {/* Imported Photos List */}
      {importedPhotos.length > 0 && (
        <div className="imported-photos">
          <div className="imported-photos-header">
            <h3>Imported Photos ({importedPhotos.length})</h3>
            <button 
              className="clear-all-btn"
              onClick={clearAllPhotos}
            >
              Clear All
            </button>
          </div>

          <div className="photos-grid">
            {importedPhotos.map(photo => (
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
                </div>
              </div>
            ))}
          </div>

          <div className="import-actions">
            <button className="process-photos-btn">
              Process Photos ({importedPhotos.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoImport; 