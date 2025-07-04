import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation data
const translations = {
  en: {
    // Navigation
    gallery: 'Gallery',
    journal: 'Journal',
    map: 'Map',
    import: 'Import',
    settings: 'Settings',
    
    // Navigation descriptions
    'nav.gallery.desc': 'Browse your bird photos',
    'nav.journal.desc': 'Timeline of sightings',
    'nav.map.desc': 'Sighting locations',
    'nav.import.desc': 'Add new photos',
    'nav.settings.desc': 'App preferences',
    
    // Gallery
    'gallery.title': 'Gallery',
    'gallery.subtitle': 'Browse your bird photos',
    'gallery.browse': 'Browse your bird photos',
    
    // Journal
    'journal.title': 'Journal',
    'journal.subtitle': 'Your birding timeline',
    'journal.timeline': 'Timeline of sightings',
    
    // Map
    'map.title': 'Map',
    'map.subtitle': 'Sighting locations',
    'map.locations': 'Sighting locations',
    
    // Import
    'import.title': 'Import Photos',
    'import.subtitle': 'Add bird photos and metadata to your collection',
    'import.add': 'Add new photos',
    'import.drag': 'Drag and drop bird photos here',
    'import.or': 'or',
    'import.choose': 'Choose Files',
    'import.process': 'Process Photos',
    'import.clear': 'Clear All',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Configure your birding app preferences',
    'settings.language': 'Language',
    'settings.appearance': 'Appearance',
    'settings.data': 'Data Management',
    'settings.about': 'About',
    'settings.selectLanguage': 'Select Language',
    'settings.theme': 'Theme',
    'settings.lightMode': 'Light Mode',
    'settings.darkMode': 'Dark Mode',
    'settings.export': 'Export Data',
    'settings.import': 'Import Data',
    'settings.backup': 'Backup Database',
    'settings.version': 'Version',
    'settings.appName': 'Avian Archive',
    'settings.description': 'Bird Photo Journal',
    
    // Database Test
    'db.title': 'Database Test Console',
    'db.subtitle': 'Testing database operations',
    'db.runTests': 'Run Tests',
    'db.clearDB': 'Clear DB',
    'db.refresh': 'Refresh',
    'db.environment': 'Environment',
    'db.results': 'Test Results',
    'db.sightings': 'Current Sightings in Database',
    
    // Gallery
    'gallery.refresh': 'Refresh',
    'gallery.clearFilters': 'Clear Filters',
    'gallery.loading': 'Loading your bird photos...',
    'gallery.errorLoading': 'Error Loading Gallery',
    'gallery.tryAgain': 'Try Again',
    'gallery.search': 'Search',
    'gallery.searchPlaceholder': 'Search species or notes...',
    'gallery.allSpecies': 'All species',
    'gallery.startDate': 'Start Date',
    'gallery.endDate': 'End Date',
    'gallery.sortBy': 'Sort by',
    'gallery.newest': 'Newest first',
    'gallery.oldest': 'Oldest first',
    'gallery.speciesName': 'Species name',
    'gallery.noPhotos': 'No Photos Found',
    'gallery.noPhotosDesc': 'Import some photos to get started!',
    'gallery.adjustFilters': 'Try adjusting your filters to see more results.',
    'gallery.view': 'View',
    'gallery.unknownSpecies': 'Unknown Species',
    'gallery.noDate': 'No date',
    'gallery.invalidDate': 'Invalid date',
    'gallery.photosCount': 'photos',

    // Journal
    'journal.loading': 'Loading your birding journal...',
    'journal.errorLoading': 'Error Loading Journal',
    'journal.expandAll': 'Expand All',
    'journal.collapseAll': 'Collapse All',
    'journal.refresh': 'Refresh',
    'journal.entriesCount': 'entries across',
    'journal.days': 'days',
    'journal.noEntries': 'No Journal Entries Yet',
    'journal.noEntriesDesc': 'Import some photos and add metadata to start your birding diary!',
    'journal.sighting': 'sighting',
    'journal.sightings': 'sightings',
    'journal.today': 'Today',
    'journal.yesterday': 'Yesterday',
    'journal.unknownDate': 'Unknown Date',
    'journal.noTime': 'No time',
    'journal.invalidTime': 'Invalid time',
    'journal.unknownSpecies': 'Unknown Species',
    'journal.entriesCount': 'entries across',
    'journal.days': 'days',
    'journal.activityMap': 'Birding Activity',
    'journal.activityMapDesc': 'Your birding activity throughout the year',
    'journal.totalSightings': 'Total Sightings',
    'journal.activeDays': 'Active Days',
    'journal.maxDay': 'Best Day',
    'journal.less': 'Less',
    'journal.more': 'More',

    // Map
    'map.title': 'Sighting Map',
    'map.subtitle': 'Explore your birding locations on an interactive map',
    'map.comingSoon': 'Interactive Map Coming Soon',
    'map.description': 'View all your bird sightings plotted on an interactive map with clustering, location details, and route tracking.',

    // Import specific
    'import.dropPhotos': 'Drop the photos here...',
    'import.dragDrop': 'Drag and drop bird photos here',
    'import.or': 'or',
    'import.chooseFiles': 'Choose Files',
    'import.processing': 'Processing...',
    'import.processPhotos': 'Process Photos',
    'import.clearAll': 'Clear All',
    'import.processingResults': 'Processing Results',
    'import.successful': 'Successful',
    'import.failed': 'Failed',
    'import.total': 'Total',
    'import.errors': 'Errors',
    'import.importedPhotos': 'Imported Photos',
    'import.aibird': 'AI Bird ID',
    'import.suggestSpecies': 'Suggest Species',
    'import.analyzing': 'Analyzing...',
    'import.confidence': 'Confidence',
    'import.useSuggestion': 'Use Suggestion',
    'import.birdSpecies': 'Bird Species',
    'import.searchSpecies': 'Search for bird species...',
    'import.photoDetails': 'Photo Details',
    'import.datetime': 'Date & Time',
    'import.location': 'Location',
    'import.latitude': 'Latitude',
    'import.longitude': 'Longitude',
    'import.notes': 'Notes',
    'import.notesPlaceholder': 'Add any notes about this sighting...',
    'import.noPhotosToProcess': 'No photos to process!',

    // Common
    'common.photos': 'Photos',
    'common.species': 'Species',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.tryAgain': 'Try Again',
    'common.of': 'of'
  },
  
  zh: {
    // Navigation
    gallery: '相册',
    journal: '日志',
    map: '地图',
    import: '导入',
    settings: '设置',
    
    // Navigation descriptions
    'nav.gallery.desc': '浏览您的鸟类照片',
    'nav.journal.desc': '观察记录时间线',
    'nav.map.desc': '观察位置',
    'nav.import.desc': '添加新照片',
    'nav.settings.desc': '应用偏好设置',
    
    // Gallery
    'gallery.title': '相册',
    'gallery.subtitle': '浏览您的鸟类照片',
    'gallery.browse': '浏览您的鸟类照片',
    
    // Journal
    'journal.title': '日志',
    'journal.subtitle': '您的观鸟时间线',
    'journal.timeline': '观察记录时间线',
    
    // Map
    'map.title': '地图',
    'map.subtitle': '观察位置',
    'map.locations': '观察位置',
    
    // Import
    'import.title': '导入照片',
    'import.subtitle': '添加鸟类照片和元数据到您的收藏',
    'import.add': '添加新照片',
    'import.drag': '将鸟类照片拖放到这里',
    'import.or': '或',
    'import.choose': '选择文件',
    'import.process': '处理照片',
    'import.clear': '全部清除',
    
    // Settings
    'settings.title': '设置',
    'settings.subtitle': '配置您的观鸟应用偏好',
    'settings.language': '语言',
    'settings.appearance': '外观',
    'settings.data': '数据管理',
    'settings.about': '关于',
    'settings.selectLanguage': '选择语言',
    'settings.theme': '主题',
    'settings.lightMode': '浅色模式',
    'settings.darkMode': '深色模式',
    'settings.export': '导出数据',
    'settings.import': '导入数据',
    'settings.appName': 'Avian Archive',
    'settings.description': '鸟类照片日志',
    
    // Database Test
    'db.title': '数据库测试控制台',
    'db.subtitle': '测试数据库操作',
    'db.runTests': '运行测试',
    'db.clearDB': '清除数据库',
    'db.refresh': '刷新',
    'db.environment': '环境',
    'db.results': '测试结果',
    'db.sightings': '数据库中的当前观察记录',
    
    // Gallery
    'gallery.refresh': '刷新',
    'gallery.clearFilters': '清除筛选',
    'gallery.loading': '正在加载您的鸟类照片...',
    'gallery.errorLoading': '加载相册时出错',
    'gallery.tryAgain': '重试',
    'gallery.search': '搜索',
    'gallery.searchPlaceholder': '搜索物种或备注...',
    'gallery.allSpecies': '所有物种',
    'gallery.startDate': '开始日期',
    'gallery.endDate': '结束日期',
    'gallery.sortBy': '排序方式',
    'gallery.newest': '最新优先',
    'gallery.oldest': '最旧优先',
    'gallery.speciesName': '物种名称',
    'gallery.noPhotos': '未找到照片',
    'gallery.noPhotosDesc': '导入一些照片以开始使用！',
    'gallery.adjustFilters': '尝试调整筛选条件以查看更多结果。',
    'gallery.view': '查看',
    'gallery.unknownSpecies': '未知物种',
    'gallery.noDate': '无日期',
    'gallery.invalidDate': '无效日期',
    'gallery.photosCount': '张照片',

    // Journal
    'journal.loading': '正在加载您的观鸟日志...',
    'journal.errorLoading': '加载日志时出错',
    'journal.expandAll': '展开全部',
    'journal.collapseAll': '收起全部',
    'journal.refresh': '刷新',
    'journal.entriesCount': '条记录，跨越',
    'journal.days': '天',
    'journal.noEntries': '暂无日志条目',
    'journal.noEntriesDesc': '导入一些照片并添加元数据以开始您的观鸟日记！',
    'journal.sighting': '次观察',
    'journal.sightings': '次观察',
    'journal.today': '今天',
    'journal.yesterday': '昨天',
    'journal.unknownDate': '未知日期',
    'journal.noTime': '无时间',
    'journal.invalidTime': '无效时间',
    'journal.unknownSpecies': '未知物种',
    'journal.entriesCount': '条记录，跨越',
    'journal.days': '天',
    'journal.activityMap': '观鸟活动',
    'journal.activityMapDesc': '您全年的观鸟活动情况',
    'journal.totalSightings': '总观察次数',
    'journal.activeDays': '活跃天数',
    'journal.maxDay': '最佳日期',
    'journal.less': '少',
    'journal.more': '多',

    // Map
    'map.title': '观察地图',
    'map.subtitle': '在交互式地图上探索您的观鸟位置',
    'map.comingSoon': '交互式地图即将推出',
    'map.description': '在交互式地图上查看您的所有鸟类观察记录，包括聚类、位置详情和路线跟踪。',

    // Import specific
    'import.dropPhotos': '将照片放在这里...',
    'import.dragDrop': '将鸟类照片拖放到这里',
    'import.or': '或',
    'import.chooseFiles': '选择文件',
    'import.processing': '处理中...',
    'import.processPhotos': '处理照片',
    'import.clearAll': '全部清除',
    'import.processingResults': '处理结果',
    'import.successful': '成功',
    'import.failed': '失败',
    'import.total': '总计',
    'import.errors': '错误',
    'import.importedPhotos': '已导入的照片',
    'import.aibird': 'AI鸟类识别',
    'import.suggestSpecies': '建议物种',
    'import.analyzing': '分析中...',
    'import.confidence': '置信度',
    'import.useSuggestion': '使用建议',
    'import.birdSpecies': '鸟类物种',
    'import.searchSpecies': '搜索鸟类物种...',
    'import.photoDetails': '照片详情',
    'import.datetime': '日期和时间',
    'import.location': '位置',
    'import.latitude': '纬度',
    'import.longitude': '经度',
    'import.notes': '备注',
    'import.notesPlaceholder': '添加关于此次观察的任何备注...',
    'import.noPhotosToProcess': '没有要处理的照片！',

    // Common
    'common.photos': '照片',
    'common.species': '物种',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.tryAgain': '重试',
    'common.of': '的'
  },

  es: {
    // Navigation
    gallery: 'Galería',
    journal: 'Diario',
    map: 'Mapa',
    import: 'Importar',
    settings: 'Configuración',
    
    // Navigation descriptions
    'nav.gallery.desc': 'Explora tus fotos de aves',
    'nav.journal.desc': 'Cronología de avistamientos',
    'nav.map.desc': 'Ubicaciones de avistamiento',
    'nav.import.desc': 'Agregar nuevas fotos',
    'nav.settings.desc': 'Preferencias de la app',
    
    // Gallery
    'gallery.title': 'Galería',
    'gallery.subtitle': 'Explora tus fotos de aves',
    'gallery.browse': 'Explora tus fotos de aves',
    'gallery.refresh': 'Actualizar',
    'gallery.clearFilters': 'Limpiar Filtros',
    'gallery.loading': 'Cargando tus fotos de aves...',
    'gallery.errorLoading': 'Error al Cargar Galería',
    'gallery.tryAgain': 'Intentar de Nuevo',
    'gallery.search': 'Buscar',
    'gallery.searchPlaceholder': 'Buscar especies o notas...',
    'gallery.allSpecies': 'Todas las especies',
    'gallery.startDate': 'Fecha de Inicio',
    'gallery.endDate': 'Fecha de Fin',
    'gallery.sortBy': 'Ordenar por',
    'gallery.newest': 'Más recientes',
    'gallery.oldest': 'Más antiguos',
    'gallery.speciesName': 'Nombre de especie',
    'gallery.noPhotos': 'No se Encontraron Fotos',
    'gallery.noPhotosDesc': '¡Importa algunas fotos para comenzar!',
    'gallery.adjustFilters': 'Intenta ajustar tus filtros para ver más resultados.',
    'gallery.view': 'Ver',
    'gallery.unknownSpecies': 'Especie Desconocida',
    'gallery.noDate': 'Sin fecha',
    'gallery.invalidDate': 'Fecha inválida',
    'gallery.photosCount': 'fotos',

    // Journal
    'journal.title': 'Diario',
    'journal.subtitle': 'Tu cronología de observación de aves',
    'journal.loading': 'Cargando tu diario de observación de aves...',
    'journal.errorLoading': 'Error al Cargar Diario',
    'journal.expandAll': 'Expandir Todo',
    'journal.collapseAll': 'Contraer Todo',
    'journal.refresh': 'Actualizar',
    'journal.noEntries': 'Aún No Hay Entradas de Diario',
    'journal.noEntriesDesc': '¡Importa algunas fotos y agrega metadatos para comenzar tu diario de observación!',
    'journal.sighting': 'avistamiento',
    'journal.sightings': 'avistamientos',
    'journal.today': 'Hoy',
    'journal.yesterday': 'Ayer',
    'journal.unknownDate': 'Fecha Desconocida',
    'journal.noTime': 'Sin hora',
    'journal.invalidTime': 'Hora inválida',
    'journal.unknownSpecies': 'Especie Desconocida',
    'journal.entriesCount': 'entradas a través de',
    'journal.days': 'días',
    'journal.activityMap': 'Actividad de Observación',
    'journal.activityMapDesc': 'Tu actividad de observación de aves durante el año',
    'journal.totalSightings': 'Avistamientos Totales',
    'journal.activeDays': 'Días Activos',
    'journal.maxDay': 'Mejor Día',
    'journal.less': 'Menos',
    'journal.more': 'Más',

    // Map
    'map.title': 'Mapa de Observaciones',
    'map.subtitle': 'Explora tus ubicaciones de observación de aves en un mapa interactivo',
    'map.comingSoon': 'Mapa Interactivo Próximamente',
    'map.description': 'Ve todas tus observaciones de aves trazadas en un mapa interactivo con agrupación, detalles de ubicación y seguimiento de rutas.',

    // Import
    'import.title': 'Importar Fotos',
    'import.subtitle': 'Agrega fotos de aves y metadatos a tu colección',
    'import.dragDrop': 'Arrastra y suelta fotos de aves aquí',
    'import.or': 'o',
    'import.chooseFiles': 'Elegir Archivos',
    'import.clearAll': 'Limpiar Todo',
    'import.processPhotos': 'Procesar Fotos',

    // Database Test
    'db.title': 'Consola de Prueba de Base de Datos',
    'db.subtitle': 'Probando operaciones de base de datos',
    'db.runTests': 'Ejecutar Pruebas',
    'db.clearDB': 'Limpiar BD',
    'db.refresh': 'Actualizar',

    // Settings
    'settings.title': 'Configuración',
    'settings.subtitle': 'Configura las preferencias de tu app de observación de aves',
    'settings.language': 'Idioma',
    'settings.appearance': 'Apariencia',
    'settings.data': 'Gestión de Datos',
    'settings.about': 'Acerca de',
    'settings.selectLanguage': 'Seleccionar Idioma',
    'settings.theme': 'Tema',
    'settings.lightMode': 'Modo Claro',
    'settings.darkMode': 'Modo Oscuro',
    'settings.export': 'Exportar Datos',
    'settings.import': 'Importar Datos',
    'settings.backup': 'Respaldar Base de Datos',
    'settings.version': 'Versión',
    'settings.appName': 'Avian Archive',
    'settings.description': 'Diario de Fotos de Aves',

    // Common
    'common.photos': 'Fotos',
    'common.species': 'Especies',
    'common.loading': 'Cargando...',
    'common.tryAgain': 'Intentar de Nuevo',
    'common.of': 'de'
  },

  fr: {
    // Navigation
    gallery: 'Galerie',
    journal: 'Journal',
    map: 'Carte',
    import: 'Importer',
    settings: 'Paramètres',
    
    // Navigation descriptions
    'nav.gallery.desc': 'Parcourez vos photos d\'oiseaux',
    'nav.journal.desc': 'Chronologie des observations',
    'nav.map.desc': 'Lieux d\'observation',
    'nav.import.desc': 'Ajouter de nouvelles photos',
    'nav.settings.desc': 'Préférences de l\'app',
    
    // Gallery
    'gallery.title': 'Galerie',
    'gallery.subtitle': 'Parcourez vos photos d\'oiseaux',
    'gallery.browse': 'Parcourez vos photos d\'oiseaux',
    'gallery.refresh': 'Actualiser',
    'gallery.clearFilters': 'Effacer les Filtres',
    'gallery.loading': 'Chargement de vos photos d\'oiseaux...',
    'gallery.errorLoading': 'Erreur de Chargement de la Galerie',
    'gallery.tryAgain': 'Réessayer',
    'gallery.search': 'Rechercher',
    'gallery.searchPlaceholder': 'Rechercher espèces ou notes...',
    'gallery.allSpecies': 'Toutes les espèces',
    'gallery.startDate': 'Date de Début',
    'gallery.endDate': 'Date de Fin',
    'gallery.sortBy': 'Trier par',
    'gallery.newest': 'Plus récents',
    'gallery.oldest': 'Plus anciens',
    'gallery.speciesName': 'Nom d\'espèce',
    'gallery.noPhotos': 'Aucune Photo Trouvée',
    'gallery.noPhotosDesc': 'Importez quelques photos pour commencer !',
    'gallery.adjustFilters': 'Essayez d\'ajuster vos filtres pour voir plus de résultats.',
    'gallery.view': 'Voir',
    'gallery.unknownSpecies': 'Espèce Inconnue',
    'gallery.noDate': 'Pas de date',
    'gallery.invalidDate': 'Date invalide',
    'gallery.photosCount': 'photos',

    // Journal
    'journal.title': 'Journal',
    'journal.subtitle': 'Votre chronologie d\'observation d\'oiseaux',
    'journal.loading': 'Chargement de votre journal d\'observation d\'oiseaux...',
    'journal.errorLoading': 'Erreur de Chargement du Journal',
    'journal.expandAll': 'Tout Développer',
    'journal.collapseAll': 'Tout Réduire',
    'journal.refresh': 'Actualiser',
    'journal.noEntries': 'Aucune Entrée de Journal Encore',
    'journal.noEntriesDesc': 'Importez quelques photos et ajoutez des métadonnées pour commencer votre journal d\'observation !',
    'journal.sighting': 'observation',
    'journal.sightings': 'observations',
    'journal.today': 'Aujourd\'hui',
    'journal.yesterday': 'Hier',
    'journal.unknownDate': 'Date Inconnue',
    'journal.noTime': 'Pas d\'heure',
    'journal.invalidTime': 'Heure invalide',
    'journal.unknownSpecies': 'Espèce Inconnue',
    'journal.entriesCount': 'entrées sur',
    'journal.days': 'jours',
    'journal.activityMap': 'Activité d\'Observation',
    'journal.activityMapDesc': 'Votre activité d\'observation d\'oiseaux tout au long de l\'année',
    'journal.totalSightings': 'Observations Totales',
    'journal.activeDays': 'Jours Actifs',
    'journal.maxDay': 'Meilleur Jour',
    'journal.less': 'Moins',
    'journal.more': 'Plus',

    // Map
    'map.title': 'Carte des Observations',
    'map.subtitle': 'Explorez vos lieux d\'observation d\'oiseaux sur une carte interactive',
    'map.comingSoon': 'Carte Interactive Bientôt Disponible',
    'map.description': 'Visualisez toutes vos observations d\'oiseaux tracées sur une carte interactive avec regroupement, détails de localisation et suivi d\'itinéraire.',

    // Import
    'import.title': 'Importer des Photos',
    'import.subtitle': 'Ajoutez des photos d\'oiseaux et des métadonnées à votre collection',
    'import.dragDrop': 'Glissez et déposez des photos d\'oiseaux ici',
    'import.or': 'ou',
    'import.chooseFiles': 'Choisir des Fichiers',
    'import.clearAll': 'Tout Effacer',
    'import.processPhotos': 'Traiter les Photos',

    // Database Test
    'db.title': 'Console de Test de Base de Données',
    'db.subtitle': 'Test des opérations de base de données',
    'db.runTests': 'Exécuter les Tests',
    'db.clearDB': 'Vider BD',
    'db.refresh': 'Actualiser',

    // Settings
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Configurez vos préférences d\'application d\'observation d\'oiseaux',
    'settings.language': 'Langue',
    'settings.appearance': 'Apparence',
    'settings.data': 'Gestion des Données',
    'settings.about': 'À Propos',
    'settings.selectLanguage': 'Sélectionner la Langue',
    'settings.theme': 'Thème',
    'settings.lightMode': 'Mode Clair',
    'settings.darkMode': 'Mode Sombre',
    'settings.export': 'Exporter les Données',
    'settings.import': 'Importer les Données',
    'settings.backup': 'Sauvegarder la Base de Données',
    'settings.version': 'Version',
    'settings.appName': 'Avian Archive',
    'settings.description': 'Journal Photo d\'Oiseaux',

    // Common
    'common.photos': 'Photos',
    'common.species': 'Espèces',
    'common.loading': 'Chargement...',
    'common.tryAgain': 'Réessayer',
    'common.of': 'de'
  },

  de: {
    // Navigation
    gallery: 'Galerie',
    journal: 'Tagebuch',
    map: 'Karte',
    import: 'Importieren',
    settings: 'Einstellungen',
    
    // Navigation descriptions
    'nav.gallery.desc': 'Durchstöbern Sie Ihre Vogelfotos',
    'nav.journal.desc': 'Zeitleiste der Sichtungen',
    'nav.map.desc': 'Sichtungsstandorte',
    'nav.import.desc': 'Neue Fotos hinzufügen',
    'nav.settings.desc': 'App-Einstellungen',
    
    // Gallery
    'gallery.title': 'Galerie',
    'gallery.subtitle': 'Durchstöbern Sie Ihre Vogelfotos',
    'gallery.browse': 'Durchstöbern Sie Ihre Vogelfotos',
    'gallery.refresh': 'Aktualisieren',
    'gallery.clearFilters': 'Filter Löschen',
    'gallery.loading': 'Ihre Vogelfotos werden geladen...',
    'gallery.errorLoading': 'Fehler beim Laden der Galerie',
    'gallery.tryAgain': 'Erneut Versuchen',
    'gallery.search': 'Suchen',
    'gallery.searchPlaceholder': 'Arten oder Notizen suchen...',
    'gallery.allSpecies': 'Alle Arten',
    'gallery.startDate': 'Startdatum',
    'gallery.endDate': 'Enddatum',
    'gallery.sortBy': 'Sortieren nach',
    'gallery.newest': 'Neueste zuerst',
    'gallery.oldest': 'Älteste zuerst',
    'gallery.speciesName': 'Artname',
    'gallery.noPhotos': 'Keine Fotos Gefunden',
    'gallery.noPhotosDesc': 'Importieren Sie einige Fotos, um zu beginnen!',
    'gallery.adjustFilters': 'Versuchen Sie, Ihre Filter anzupassen, um mehr Ergebnisse zu sehen.',
    'gallery.view': 'Ansehen',
    'gallery.unknownSpecies': 'Unbekannte Art',
    'gallery.noDate': 'Kein Datum',
    'gallery.invalidDate': 'Ungültiges Datum',
    'gallery.photosCount': 'Fotos',

    // Journal
    'journal.title': 'Tagebuch',
    'journal.subtitle': 'Ihre Vogelbeobachtungs-Zeitleiste',
    'journal.loading': 'Ihr Vogelbeobachtungs-Tagebuch wird geladen...',
    'journal.errorLoading': 'Fehler beim Laden des Tagebuchs',
    'journal.expandAll': 'Alle Erweitern',
    'journal.collapseAll': 'Alle Einklappen',
    'journal.refresh': 'Aktualisieren',
    'journal.noEntries': 'Noch Keine Tagebucheinträge',
    'journal.noEntriesDesc': 'Importieren Sie einige Fotos und fügen Sie Metadaten hinzu, um Ihr Vogelbeobachtungs-Tagebuch zu beginnen!',
    'journal.sighting': 'Sichtung',
    'journal.sightings': 'Sichtungen',
    'journal.today': 'Heute',
    'journal.yesterday': 'Gestern',
    'journal.unknownDate': 'Unbekanntes Datum',
    'journal.noTime': 'Keine Zeit',
    'journal.invalidTime': 'Ungültige Zeit',
    'journal.unknownSpecies': 'Unbekannte Art',
    'journal.entriesCount': 'Einträge über',
    'journal.days': 'Tage',
    'journal.activityMap': 'Beobachtungsaktivität',
    'journal.activityMapDesc': 'Ihre Vogelbeobachtungsaktivität das ganze Jahr über',
    'journal.totalSightings': 'Gesamt Sichtungen',
    'journal.activeDays': 'Aktive Tage',
    'journal.maxDay': 'Bester Tag',
    'journal.less': 'Weniger',
    'journal.more': 'Mehr',

    // Map
    'map.title': 'Beobachtungskarte',
    'map.subtitle': 'Erkunden Sie Ihre Vogelbeobachtungsstandorte auf einer interaktiven Karte',
    'map.comingSoon': 'Interaktive Karte Kommt Bald',
    'map.description': 'Sehen Sie alle Ihre Vogelbeobachtungen auf einer interaktiven Karte mit Clustering, Standortdetails und Routenverfolgung.',

    // Import
    'import.title': 'Fotos Importieren',
    'import.subtitle': 'Fügen Sie Vogelfotos und Metadaten zu Ihrer Sammlung hinzu',
    'import.dragDrop': 'Vogelfotos hier hineinziehen und ablegen',
    'import.or': 'oder',
    'import.chooseFiles': 'Dateien Auswählen',
    'import.clearAll': 'Alle Löschen',
    'import.processPhotos': 'Fotos Verarbeiten',

    // Database Test
    'db.title': 'Datenbank-Testkonsole',
    'db.subtitle': 'Datenbankoperationen testen',
    'db.runTests': 'Tests Ausführen',
    'db.clearDB': 'DB Löschen',
    'db.refresh': 'Aktualisieren',

    // Settings
    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Konfigurieren Sie Ihre Vogelbeobachtungs-App-Einstellungen',
    'settings.language': 'Sprache',
    'settings.appearance': 'Erscheinungsbild',
    'settings.data': 'Datenverwaltung',
    'settings.about': 'Über',
    'settings.selectLanguage': 'Sprache Auswählen',
    'settings.theme': 'Design',
    'settings.lightMode': 'Heller Modus',
    'settings.darkMode': 'Dunkler Modus',
    'settings.export': 'Daten Exportieren',
    'settings.import': 'Daten Importieren',
    'settings.backup': 'Datenbank Sichern',
    'settings.version': 'Version',
    'settings.appName': 'Avian Archive',
    'settings.description': 'Vogelfoto-Tagebuch',

    // Common
    'common.photos': 'Fotos',
    'common.species': 'Arten',
    'common.loading': 'Wird geladen...',
    'common.tryAgain': 'Erneut Versuchen',
    'common.of': 'von'
  },

  ja: {
    // Navigation
    gallery: 'ギャラリー',
    journal: '日記',
    map: 'マップ',
    import: 'インポート',
    settings: '設定',
    
    // Navigation descriptions
    'nav.gallery.desc': '鳥の写真を閲覧',
    'nav.journal.desc': '観察記録のタイムライン',
    'nav.map.desc': '観察地点',
    'nav.import.desc': '新しい写真を追加',
    'nav.settings.desc': 'アプリの設定',
    
    // Gallery
    'gallery.title': 'ギャラリー',
    'gallery.subtitle': '鳥の写真を閲覧',
    'gallery.browse': '鳥の写真を閲覧',
    'gallery.refresh': '更新',
    'gallery.clearFilters': 'フィルタをクリア',
    'gallery.loading': '鳥の写真を読み込み中...',
    'gallery.errorLoading': 'ギャラリーの読み込みエラー',
    'gallery.tryAgain': '再試行',
    'gallery.search': '検索',
    'gallery.searchPlaceholder': '種類やメモを検索...',
    'gallery.allSpecies': 'すべての種類',
    'gallery.startDate': '開始日',
    'gallery.endDate': '終了日',
    'gallery.sortBy': '並び替え',
    'gallery.newest': '新しい順',
    'gallery.oldest': '古い順',
    'gallery.speciesName': '種名',
    'gallery.noPhotos': '写真が見つかりません',
    'gallery.noPhotosDesc': '始めるには写真をインポートしてください！',
    'gallery.adjustFilters': 'より多くの結果を表示するには、フィルターを調整してみてください。',
    'gallery.view': '表示',
    'gallery.unknownSpecies': '不明な種',
    'gallery.noDate': '日付なし',
    'gallery.invalidDate': '無効な日付',
    'gallery.photosCount': '枚の写真',

    // Journal
    'journal.title': '日記',
    'journal.subtitle': 'あなたのバードウォッチングタイムライン',
    'journal.loading': 'バードウォッチング日記を読み込み中...',
    'journal.errorLoading': '日記の読み込みエラー',
    'journal.expandAll': 'すべて展開',
    'journal.collapseAll': 'すべて折りたたむ',
    'journal.refresh': '更新',
    'journal.noEntries': 'まだ日記エントリがありません',
    'journal.noEntriesDesc': '写真をインポートしてメタデータを追加し、バードウォッチング日記を始めましょう！',
    'journal.sighting': '回の観察',
    'journal.sightings': '回の観察',
    'journal.today': '今日',
    'journal.yesterday': '昨日',
    'journal.unknownDate': '不明な日付',
    'journal.noTime': '時刻なし',
    'journal.invalidTime': '無効な時刻',
    'journal.unknownSpecies': '不明な種',
    'journal.entriesCount': '件のエントリ、',
    'journal.days': '日間',
    'journal.activityMap': 'バードウォッチング活動',
    'journal.activityMapDesc': '年間のバードウォッチング活動',
    'journal.totalSightings': '総観察数',
    'journal.activeDays': 'アクティブな日数',
    'journal.maxDay': '最高の日',
    'journal.less': '少',
    'journal.more': '多',

    // Map
    'map.title': '観察マップ',
    'map.subtitle': 'インタラクティブマップでバードウォッチングの場所を探索',
    'map.comingSoon': 'インタラクティブマップ近日公開',
    'map.description': 'クラスタリング、位置詳細、ルート追跡機能付きのインタラクティブマップで、すべての鳥の観察記録を表示します。',

    // Import
    'import.title': '写真をインポート',
    'import.subtitle': '鳥の写真とメタデータをコレクションに追加',
    'import.dragDrop': '鳥の写真をここにドラッグ＆ドロップ',
    'import.or': 'または',
    'import.chooseFiles': 'ファイルを選択',
    'import.clearAll': 'すべてクリア',
    'import.processPhotos': '写真を処理',

    // Database Test
    'db.title': 'データベーステストコンソール',
    'db.subtitle': 'データベース操作のテスト',
    'db.runTests': 'テスト実行',
    'db.clearDB': 'DB削除',
    'db.refresh': '更新',

    // Settings
    'settings.title': '設定',
    'settings.subtitle': 'バードウォッチングアプリの設定を構成',
    'settings.language': '言語',
    'settings.appearance': '外観',
    'settings.data': 'データ管理',
    'settings.about': 'について',
    'settings.selectLanguage': '言語を選択',
    'settings.theme': 'テーマ',
    'settings.lightMode': 'ライトモード',
    'settings.darkMode': 'ダークモード',
    'settings.export': 'データエクスポート',
    'settings.import': 'データインポート',
    'settings.backup': 'データベースバックアップ',
    'settings.version': 'バージョン',
    'settings.appName': 'Avian Archive',
    'settings.description': '鳥の写真日記',

    // Common
    'common.photos': '写真',
    'common.species': '種類',
    'common.loading': '読み込み中...',
    'common.tryAgain': '再試行',
    'common.of': 'の'
  },

  ru: {
    // Navigation
    gallery: 'Галерея',
    journal: 'Дневник',
    map: 'Карта',
    import: 'Импорт',
    settings: 'Настройки',
    
    // Navigation descriptions
    'nav.gallery.desc': 'Просмотрите ваши фотографии птиц',
    'nav.journal.desc': 'Хронология наблюдений',
    'nav.map.desc': 'Места наблюдений',
    'nav.import.desc': 'Добавить новые фотографии',
    'nav.settings.desc': 'Настройки приложения',
    
    // Gallery
    'gallery.title': 'Галерея',
    'gallery.subtitle': 'Просмотрите ваши фотографии птиц',
    'gallery.browse': 'Просмотрите ваши фотографии птиц',
    'gallery.refresh': 'Обновить',
    'gallery.clearFilters': 'Очистить Фильтры',
    'gallery.loading': 'Загрузка ваших фотографий птиц...',
    'gallery.errorLoading': 'Ошибка Загрузки Галереи',
    'gallery.tryAgain': 'Попробовать Снова',
    'gallery.search': 'Поиск',
    'gallery.searchPlaceholder': 'Поиск видов или заметок...',
    'gallery.allSpecies': 'Все виды',
    'gallery.startDate': 'Дата Начала',
    'gallery.endDate': 'Дата Окончания',
    'gallery.sortBy': 'Сортировать по',
    'gallery.newest': 'Сначала новые',
    'gallery.oldest': 'Сначала старые',
    'gallery.speciesName': 'Название вида',
    'gallery.noPhotos': 'Фотографии Не Найдены',
    'gallery.noPhotosDesc': 'Импортируйте фотографии, чтобы начать!',
    'gallery.adjustFilters': 'Попробуйте настроить фильтры, чтобы увидеть больше результатов.',
    'gallery.view': 'Просмотр',
    'gallery.unknownSpecies': 'Неизвестный Вид',
    'gallery.noDate': 'Нет даты',
    'gallery.invalidDate': 'Неверная дата',
    'gallery.photosCount': 'фотографий',

    // Journal
    'journal.title': 'Дневник',
    'journal.subtitle': 'Ваша хронология наблюдения за птицами',
    'journal.loading': 'Загрузка вашего дневника наблюдения за птицами...',
    'journal.errorLoading': 'Ошибка Загрузки Дневника',
    'journal.expandAll': 'Развернуть Все',
    'journal.collapseAll': 'Свернуть Все',
    'journal.refresh': 'Обновить',
    'journal.noEntries': 'Пока Нет Записей в Дневнике',
    'journal.noEntriesDesc': 'Импортируйте фотографии и добавьте метаданные, чтобы начать свой дневник наблюдения за птицами!',
    'journal.sighting': 'наблюдение',
    'journal.sightings': 'наблюдений',
    'journal.today': 'Сегодня',
    'journal.yesterday': 'Вчера',
    'journal.unknownDate': 'Неизвестная Дата',
    'journal.noTime': 'Нет времени',
    'journal.invalidTime': 'Неверное время',
    'journal.unknownSpecies': 'Неизвестный Вид',
    'journal.entriesCount': 'записей за',
    'journal.days': 'дней',
    'journal.activityMap': 'Активность Наблюдений',
    'journal.activityMapDesc': 'Ваша активность наблюдения за птицами в течение года',
    'journal.totalSightings': 'Всего Наблюдений',
    'journal.activeDays': 'Активных Дней',
    'journal.maxDay': 'Лучший День',
    'journal.less': 'Меньше',
    'journal.more': 'Больше',

    // Map
    'map.title': 'Карта Наблюдений',
    'map.subtitle': 'Исследуйте места наблюдения за птицами на интерактивной карте',
    'map.comingSoon': 'Интерактивная Карта Скоро',
    'map.description': 'Просматривайте все ваши наблюдения за птицами на интерактивной карте с кластеризацией, деталями местоположения и отслеживанием маршрутов.',

    // Import
    'import.title': 'Импорт Фотографий',
    'import.subtitle': 'Добавьте фотографии птиц и метаданные в вашу коллекцию',
    'import.dragDrop': 'Перетащите фотографии птиц сюда',
    'import.or': 'или',
    'import.chooseFiles': 'Выбрать Файлы',
    'import.clearAll': 'Очистить Все',
    'import.processPhotos': 'Обработать Фотографии',

    // Database Test
    'db.title': 'Консоль Тестирования Базы Данных',
    'db.subtitle': 'Тестирование операций базы данных',
    'db.runTests': 'Запустить Тесты',
    'db.clearDB': 'Очистить БД',
    'db.refresh': 'Обновить',

    // Settings
    'settings.title': 'Настройки',
    'settings.subtitle': 'Настройте параметры приложения для наблюдения за птицами',
    'settings.language': 'Язык',
    'settings.appearance': 'Внешний Вид',
    'settings.data': 'Управление Данными',
    'settings.about': 'О Программе',
    'settings.selectLanguage': 'Выберите Язык',
    'settings.theme': 'Тема',
    'settings.lightMode': 'Светлый Режим',
    'settings.darkMode': 'Тёмный Режим',
    'settings.export': 'Экспорт Данных',
    'settings.import': 'Импорт Данных',
    'settings.backup': 'Резервная Копия БД',
    'settings.version': 'Версия',
    'settings.appName': 'Avian Archive',
    'settings.description': 'Дневник Фотографий Птиц',

    // Common
    'common.photos': 'Фотографии',
    'common.species': 'Виды',
    'common.loading': 'Загрузка...',
    'common.tryAgain': 'Попробовать Снова',
    'common.of': 'из'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to English
    return localStorage.getItem('app-language') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  const value = {
    language,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 