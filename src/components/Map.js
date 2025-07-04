import React from 'react';
import MainContent from './Layout/MainContent';
import { useLanguage } from '../context/LanguageContext';

const Map = () => {
  const { t } = useLanguage();

  return (
    <MainContent
      title={t('map.title')}
      subtitle={t('map.subtitle')}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        background: 'white',
        borderRadius: '12px',
        border: '2px dashed #e2e8f0',
        color: '#64748b',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '4rem' }}>🗺️</div>
        <h3 style={{ margin: 0, color: '#475569' }}>{t('map.comingSoon')}</h3>
        <p style={{ margin: 0, textAlign: 'center', maxWidth: '400px' }}>
          {t('map.description')}
        </p>
      </div>
    </MainContent>
  );
};

export default Map; 