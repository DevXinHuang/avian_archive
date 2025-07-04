import React from 'react';
import './MainContent.css';

const MainContent = ({ children, title, subtitle, actions }) => {
  return (
    <main className="main-content">
      {/* Content Header */}
      {(title || subtitle || actions) && (
        <header className="content-header">
          <div className="header-info">
            {title && <h1 className="content-title">{title}</h1>}
            {subtitle && <p className="content-subtitle">{subtitle}</p>}
          </div>
          {actions && (
            <div className="header-actions">
              {actions}
            </div>
          )}
        </header>
      )}

      {/* Content Body */}
      <div className="content-body">
        {children}
      </div>
    </main>
  );
};

export default MainContent; 