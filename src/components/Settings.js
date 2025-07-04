import React from 'react';
import MainContent from './Layout/MainContent';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

const Settings = () => {
  const { language, changeLanguage, t, availableLanguages } = useLanguage();
  const { theme, setThemeMode, isDark } = useTheme();

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  const handleThemeChange = (newTheme) => {
    setThemeMode(newTheme);
  };

  const handleExportData = () => {
    // Implementation for data export
    alert(t('settings.export') + ' - ' + t('common.loading'));
  };

  const handleImportData = () => {
    // Implementation for data import
    alert(t('settings.import') + ' - ' + t('common.loading'));
  };

  const handleBackupDatabase = () => {
    // Implementation for database backup
    alert(t('settings.backup') + ' - ' + t('common.loading'));
  };

  return (
    <MainContent
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
    >
      <div className="settings-container">
        
        {/* Language Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">
              🌐 {t('settings.language')}
            </h3>
          </div>
          <div className="settings-card-body">
            <div className="language-section">
              <label className="language-label">
                {t('settings.selectLanguage')}
              </label>
              <select 
                value={language} 
                onChange={handleLanguageChange}
                className="language-select"
              >
                {availableLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
            <p className="language-description">
              {language === 'zh' 
                ? '选择您偏好的应用界面语言。更改将立即生效。'
                : 'Choose your preferred language for the app interface. Changes take effect immediately.'
              }
            </p>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">
              🎨 {t('settings.appearance')}
            </h3>
          </div>
          <div className="settings-card-body">
            <div className="theme-section">
              <label className="theme-label">
                {t('settings.theme')}
              </label>
              <div className="theme-buttons">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                >
                  ☀️ {t('settings.lightMode')}
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                >
                  🌙 {t('settings.darkMode')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">
              💾 {t('settings.data')}
            </h3>
          </div>
          <div className="settings-card-body">
            <div className="data-actions">
              <button
                onClick={handleExportData}
                className="data-action-btn"
              >
                <span className="data-action-icon">📤</span>
                <div className="data-action-content">
                  <div className="data-action-title">{t('settings.export')}</div>
                  <div className="data-action-desc">
                    {language === 'zh' ? '导出您的观鸟数据到文件' : 'Export your birding data to a file'}
                  </div>
                </div>
              </button>
              
              <button
                onClick={handleImportData}
                className="data-action-btn"
              >
                <span className="data-action-icon">📥</span>
                <div className="data-action-content">
                  <div className="data-action-title">{t('settings.import')}</div>
                  <div className="data-action-desc">
                    {language === 'zh' ? '从文件导入观鸟数据' : 'Import birding data from a file'}
                  </div>
                </div>
              </button>
              
              <button
                onClick={handleBackupDatabase}
                className="data-action-btn"
              >
                <span className="data-action-icon">🗄️</span>
                <div className="data-action-content">
                  <div className="data-action-title">{t('settings.backup')}</div>
                  <div className="data-action-desc">
                    {language === 'zh' ? '创建数据库的备份副本' : 'Create a backup copy of your database'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3 className="settings-card-title">
              ℹ️ {t('settings.about')}
            </h3>
          </div>
          <div className="settings-card-body">
            <div className="about-content">
              <div className="about-icon">🦅</div>
              <div className="about-info">
                <h4 className="about-title">
                  {t('settings.appName')}
                </h4>
                <p className="about-subtitle">
                  {t('settings.description')}
                </p>
                <p className="about-version">
                  {t('settings.version')} 1.0.0
                </p>
              </div>
            </div>
            <p className="about-description">
              {language === 'zh' 
                ? '一个本地优先的观鸟应用，用于组织鸟类照片和观察记录。您的数据安全地存储在本地设备上。'
                : 'A local-first birding app for organizing bird photos and sightings. Your data is stored securely on your local device.'
              }
            </p>
          </div>
        </div>

      </div>
    </MainContent>
  );
};

export default Settings; 