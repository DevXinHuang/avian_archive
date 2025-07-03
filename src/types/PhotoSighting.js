/**
 * @typedef {Object} PhotoSighting
 * @property {string} filePath - Path to the photo file
 * @property {string} species - Bird species name (common name)
 * @property {string} datetime - ISO datetime string when the photo was taken
 * @property {number|null} latitude - GPS latitude coordinate (-90 to 90)
 * @property {number|null} longitude - GPS longitude coordinate (-180 to 180)
 * @property {string} notes - User notes/observations about the sighting
 * @property {number} [id] - Database ID (auto-generated, optional for new entries)
 * @property {string} [created_at] - ISO datetime when record was created (database field)
 * @property {string} [updated_at] - ISO datetime when record was last updated (database field)
 */

/**
 * @typedef {Object} PhotoSightingInput
 * @property {string} filePath - Path to the photo file
 * @property {string} species - Bird species name (common name)
 * @property {string} datetime - ISO datetime string when the photo was taken
 * @property {number|null} latitude - GPS latitude coordinate (-90 to 90)
 * @property {number|null} longitude - GPS longitude coordinate (-180 to 180)
 * @property {string} notes - User notes/observations about the sighting
 */

/**
 * @typedef {Object} DatabaseResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {PhotoSighting[]|PhotoSighting|number} [data] - Response data (varies by operation)
 * @property {string} [error] - Error message if operation failed
 * @property {number} [id] - ID of created/updated record (for insert/update operations)
 */

/**
 * Creates a new PhotoSighting object with default values
 * @param {Partial<PhotoSightingInput>} input - Partial sighting data
 * @returns {PhotoSightingInput} Complete sighting object with defaults
 */
export const createPhotoSighting = (input = {}) => {
  return {
    filePath: input.filePath || '',
    species: input.species || '',
    datetime: input.datetime || '',
    latitude: input.latitude || null,
    longitude: input.longitude || null,
    notes: input.notes || ''
  };
};

/**
 * Validates a PhotoSighting object
 * @param {PhotoSightingInput} sighting - Sighting to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
export const validatePhotoSighting = (sighting) => {
  const errors = [];

  if (!sighting.filePath || typeof sighting.filePath !== 'string') {
    errors.push('filePath is required and must be a string');
  }

  if (typeof sighting.species !== 'string') {
    errors.push('species must be a string');
  }

  if (typeof sighting.datetime !== 'string') {
    errors.push('datetime must be a string');
  } else if (sighting.datetime && isNaN(Date.parse(sighting.datetime))) {
    errors.push('datetime must be a valid ISO date string');
  }

  if (sighting.latitude !== null && (typeof sighting.latitude !== 'number' || sighting.latitude < -90 || sighting.latitude > 90)) {
    errors.push('latitude must be null or a number between -90 and 90');
  }

  if (sighting.longitude !== null && (typeof sighting.longitude !== 'number' || sighting.longitude < -180 || sighting.longitude > 180)) {
    errors.push('longitude must be null or a number between -180 and 180');
  }

  if (typeof sighting.notes !== 'string') {
    errors.push('notes must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Converts latitude/longitude strings to numbers for database storage
 * @param {Object} metadata - Metadata object with string lat/lng
 * @returns {Object} Metadata with numeric lat/lng
 */
export const normalizeCoordinates = (metadata) => {
  return {
    ...metadata,
    latitude: metadata.latitude ? parseFloat(metadata.latitude) : null,
    longitude: metadata.longitude ? parseFloat(metadata.longitude) : null
  };
};

// Export types for JSDoc usage in other files
export default {}; 