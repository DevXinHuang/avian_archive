/**
 * @typedef {import('../types/PhotoSighting').PhotoSighting} PhotoSighting
 */

/**
 * Utility function to create test sightings data for the Journal view
 * @returns {PhotoSighting[]} Array of test sightings
 */
export const createTestSightings = () => {
  const testSightings = [
    {
      id: 1,
      filePath: 'robin-photo-1.jpg',
      species: 'American Robin',
      datetime: new Date().toISOString(), // Today
      latitude: 40.7128,
      longitude: -74.0060,
      notes: 'Beautiful robin spotted in Central Park this morning. Very active and vocal.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      filePath: 'cardinal-photo.jpg',
      species: 'Northern Cardinal',
      datetime: new Date().toISOString(), // Today
      latitude: 40.7589,
      longitude: -73.9851,
      notes: 'Bright red male cardinal at the bird feeder.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      filePath: 'bluejay-photo.jpg',
      species: 'Blue Jay',
      datetime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      latitude: 40.7505,
      longitude: -73.9934,
      notes: 'Loud and intelligent Blue Jay caching acorns for winter.',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      filePath: 'sparrow-photo.jpg',
      species: 'House Sparrow',
      datetime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      latitude: 40.7282,
      longitude: -74.0776,
      notes: 'Small flock of sparrows feeding on scattered seeds.',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      filePath: 'hawk-photo.jpg',
      species: 'Red-tailed Hawk',
      datetime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      latitude: 40.7831,
      longitude: -73.9712,
      notes: 'Magnificent Red-tailed Hawk perched on a tall oak tree, scanning for prey.',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 6,
      filePath: 'finch-photo.jpg',
      species: 'American Goldfinch',
      datetime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      latitude: 40.7411,
      longitude: -74.0106,
      notes: 'Bright yellow goldfinch feeding on thistle seeds.',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 7,
      filePath: 'woodpecker-photo.jpg',
      species: 'Downy Woodpecker',
      datetime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      latitude: 40.7614,
      longitude: -73.9776,
      notes: 'Small woodpecker drumming on dead tree branch.',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 8,
      filePath: 'crow-photo.jpg',
      species: 'American Crow',
      datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      latitude: 40.7320,
      longitude: -74.0052,
      notes: 'Intelligent crow observed using tools to extract insects.',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return testSightings;
};

/**
 * Function to populate localStorage with test data
 * @returns {PhotoSighting[]} Array of created test sightings
 */
export const populateTestData = () => {
  const testSightings = createTestSightings();
  localStorage.setItem('mockSightings', JSON.stringify(testSightings));
  console.log(`Added ${testSightings.length} test sightings to localStorage`);
  return testSightings;
};

/**
 * Function to clear test data from localStorage
 * @returns {void}
 */
export const clearTestData = () => {
  localStorage.removeItem('mockSightings');
  console.log('Cleared test sightings from localStorage');
};

/**
 * Function to add test data if none exists
 * @returns {PhotoSighting[]} Array of existing or newly created test sightings
 */
export const ensureTestData = () => {
  const existing = localStorage.getItem('mockSightings');
  if (!existing || JSON.parse(existing).length === 0) {
    return populateTestData();
  }
  console.log('Test data already exists');
  return JSON.parse(existing);
}; 