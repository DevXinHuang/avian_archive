# 🦅 Birding App

A local-first desktop application for birdwatchers to organize their bird photos and sightings, built with Electron and React.

## Features

### ✅ Completed
- **Photo Import UI** - Drag-and-drop or file picker to import bird images
- **Beautiful Interface** - Modern, responsive design with intuitive navigation
- **Electron Desktop App** - Native desktop experience
- **Photo Preview** - Thumbnail previews with metadata display

### 🚧 Coming Soon
- **Species Tagging** - Auto-complete based on comprehensive bird species database
- **Metadata Form** - Date/time, GPS location, and notes for each photo
- **SQLite Database** - Local storage for all sighting data
- **Search & Filter** - Find photos by species, date, or location
- **Journal View** - Timeline of all bird sightings
- **AI Bird ID** - Offline species identification (placeholder ready)

## Project Structure

```
birding-app/
├── src/
│   ├── components/
│   │   ├── PhotoImport.js     # Drag-and-drop photo import
│   │   ├── Gallery.js         # Photo gallery (coming soon)
│   │   └── Journal.js         # Sighting journal (coming soon)
│   ├── data/
│   │   └── bird-species.json  # Bird species database
│   ├── electron/
│   │   └── main.js           # Electron main process
│   └── utils/                # Utility functions (coming soon)
├── public/
│   └── index.html
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Development mode:**
   ```bash
   npm run dev
   ```
   This will start both the React development server and Electron app.

3. **Build for production:**
   ```bash
   npm run build-electron
   ```

### Available Scripts

- `npm start` - Start React development server
- `npm run electron` - Start Electron app (production build)
- `npm run electron-dev` - Start Electron app (development mode)
- `npm run dev` - Start both React and Electron in development mode
- `npm run build` - Build React app for production
- `npm run build-electron` - Build complete Electron app

## Usage

### Photo Import
1. Launch the app and navigate to the "Import" tab (default)
2. Drag and drop bird photos onto the drop zone, or click "Choose Files"
3. Photos will appear in a grid with previews
4. Remove individual photos with the × button or clear all photos
5. Click "Process Photos" to add them to your birding database (coming soon)

### Navigation
- **Import**: Add new bird photos to your collection
- **Gallery**: Browse and search your photos (coming soon)
- **Journal**: Timeline view of sightings (coming soon)

## Technical Details

### Built With
- **Electron** - Desktop app framework
- **React** - Frontend UI library
- **React Router** - Navigation
- **React Dropzone** - File drag-and-drop functionality
- **SQLite3** - Local database (integration coming soon)

### Key Features
- Local-first architecture - all data stays on your device
- Cross-platform desktop support (Windows, macOS, Linux)
- Responsive design that works on different screen sizes
- Memory-efficient photo handling with URL object cleanup

## Development Roadmap

### Phase 1: Core Features ✅
- [x] Project setup and basic structure
- [x] Photo import with drag-and-drop
- [x] Navigation and routing
- [x] Responsive UI design

### Phase 2: Data Management
- [ ] Species tagging with auto-complete
- [ ] Metadata form (date, location, notes)
- [ ] SQLite database integration
- [ ] Data persistence

### Phase 3: Advanced Features
- [ ] Search and filter functionality
- [ ] Journal timeline view
- [ ] Data export/import
- [ ] Settings and preferences

### Phase 4: AI Integration
- [ ] Offline bird species identification
- [ ] TensorFlow Lite integration
- [ ] Confidence scoring

## Contributing

This is a personal birding app project. Feel free to fork and modify for your own use!

## License

MIT License - feel free to use this code for your own birding adventures! 🐦 