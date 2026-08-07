import React from 'react';
import styles from './Footer.module.css';
import { useFooter } from './hooks/useFooter';
import FooterFontTool from './components/FooterFontTool';
import { FontIcon } from './components/FooterIcons';

const Footer = () => {
  const { activeTool, toggleTool, closeTool } = useFooter();

  return (
    <div className={styles['footer-wrapper']}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          className={`${styles['footer-btn']} ${activeTool === 'font' ? styles['active'] : ''}`}
          onClick={() => toggleTool('font')}
          title="폰트 딕셔너리 관리"
        >
          <FontIcon size={16} />
          폰트 매핑
        </button>
      </div>

      {activeTool === 'font' && <FooterFontTool onClose={closeTool} />}
    </div>
  );
};

export default Footer;