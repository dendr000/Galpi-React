import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosCore';
import styles from './NovelViewer.module.css';

const NovelViewerPage = () => {
  const { pageId } = useParams();
  const [searchParams] = useSearchParams();
  const workId = searchParams.get('workId');
  const navigate = useNavigate();
  
  const [page, setPage] = useState({ title: '로딩 중...', content: '', workId: workId });
  const [loading, setLoading] = useState(true);

  // 로컬 스토리지 연동 설정
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('galpi-viewer-config')) || { theme: 'light', font: 'serif', fontSize: 18, lineHeight: 1.8 }; }
    catch { return { theme: 'light', font: 'serif', fontSize: 18, lineHeight: 1.8 }; }
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    api.get(`/api/wikipages/${pageId}`).then(res => setPage(res.data))
       .catch(() => { alert('문서를 불러올 수 없습니다.'); navigate(-1); })
       .finally(() => setLoading(false));
  }, [pageId, navigate]);

  useEffect(() => { localStorage.setItem('galpi-viewer-config', JSON.stringify(config)); }, [config]);

  // 스크롤 방향 감지 및 진행률 연산
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 60) { setShowHeader(false); setShowSettings(false); }
      else if (currentY < lastScrollY.current) { setShowHeader(true); }
      lastScrollY.current = currentY;

      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(height > 0 ? (currentY / height) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updateConfig = (k, v) => setConfig(prev => ({...prev, [k]: v}));

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;

  let htmlContent = page.content || "내용이 없습니다.";
  htmlContent = htmlContent.replace(/\{([^_}]+)_([^\}]+)\}/g, (match, w, i) => {
    const ext = i.trim().match(/\.(png|jpg|jpeg|gif|webp)$/i) ? '' : '.png';
    return `<img src="/img/character/${encodeURIComponent(w.trim() + "_" + i.trim() + ext)}" alt="${i.trim()}" data-action="zoom" />`;
  });
  if (!htmlContent.includes('<p>') && !htmlContent.includes('<br>') && htmlContent.includes('\n')) {
    htmlContent = htmlContent.split(/\n\n+/).filter(Boolean).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  }

  const themeVars = {
    light: { '--nv-bg': '#f8f9fa', '--nv-text': '#212529', '--nv-toolbar-bg': 'rgba(255, 255, 255, 0.95)', '--nv-toolbar-border': '#e9ecef', '--nv-primary': '#3b5bdb' },
    dark:  { '--nv-bg': '#121212', '--nv-text': '#e0e0e0', '--nv-toolbar-bg': 'rgba(30, 30, 30, 0.95)', '--nv-toolbar-border': '#333', '--nv-primary': '#5c7cfa' },
    sepia: { '--nv-bg': '#f4ecd8', '--nv-text': '#5b4636', '--nv-toolbar-bg': 'rgba(244, 236, 216, 0.95)', '--nv-toolbar-border': '#e3d5b8', '--nv-primary': '#8a6d3b' }
  };

  return (
    <div className={styles.layout} style={{ ...themeVars[config.theme], '--nv-font': config.font === 'serif' ? '"KoPub Batang", "바탕", serif' : '"KoPub Dotum", "돋움", sans-serif' }} onClick={(e) => { if(e.target.tagName !== 'IMG') { setShowHeader(!showHeader); setShowSettings(false); } }}>
      <header className={`${styles.header} ${!showHeader ? styles.headerHidden : ''}`} onClick={e => e.stopPropagation()}>
        <div className={styles.headerGroup}>
          <button className={styles.btn} onClick={() => navigate(`/work/${page.workId}`)}>🔙</button>
          <h1 className={styles.title}>{page.title}</h1>
        </div>
        <div className={styles.headerGroup}>
          <button className={styles.btn} onClick={() => setShowSettings(!showSettings)}>⚙️</button>
          <button className={styles.btn} onClick={() => navigate(`/edit?type=page&action=edit&id=${pageId}&workId=${page.workId}`)}>✏️</button>
        </div>
      </header>

      {showSettings && (
        <div className={styles.settingsPanel} onClick={e => e.stopPropagation()}>
          <div className={styles.settingGroup}><span className={styles.settingLabel}>테마 색상</span>
            <div className={styles.settingControls}>
              <button className={`${styles.settingBtn} ${config.theme === 'light' ? styles.active : ''}`} onClick={() => updateConfig('theme', 'light')}>화이트</button>
              <button className={`${styles.settingBtn} ${config.theme === 'dark' ? styles.active : ''}`} onClick={() => updateConfig('theme', 'dark')}>다크</button>
              <button className={`${styles.settingBtn} ${config.theme === 'sepia' ? styles.active : ''}`} onClick={() => updateConfig('theme', 'sepia')}>세피아</button>
            </div>
          </div>
          <div className={styles.settingGroup}><span className={styles.settingLabel}>폰트 설정</span>
            <div className={styles.settingControls}>
              <button className={`${styles.settingBtn} ${config.font === 'serif' ? styles.active : ''}`} onClick={() => updateConfig('font', 'serif')}>명조체</button>
              <button className={`${styles.settingBtn} ${config.font === 'sans-serif' ? styles.active : ''}`} onClick={() => updateConfig('font', 'sans-serif')}>고딕체</button>
            </div>
          </div>
          <div className={styles.settingGroup}><span className={styles.settingLabel}>글자 크기 / 줄 간격</span>
            <div className={styles.settingControls}>
              <button className={styles.settingBtn} onClick={() => updateConfig('fontSize', Math.max(12, config.fontSize - 2))}>크기 ➖</button>
              <button className={styles.settingBtn} onClick={() => updateConfig('fontSize', Math.min(36, config.fontSize + 2))}>크기 ➕</button>
            </div>
            <div className={styles.settingControls}>
              <button className={styles.settingBtn} onClick={() => updateConfig('lineHeight', Math.max(1.2, parseFloat((config.lineHeight - 0.2).toFixed(1))))}>간격 ➖</button>
              <button className={styles.settingBtn} onClick={() => updateConfig('lineHeight', Math.min(3.0, parseFloat((config.lineHeight + 0.2).toFixed(1))))}>간격 ➕</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.contentContainer}>
        <div className={styles.content} style={{ fontSize: `${config.fontSize}px`, lineHeight: config.lineHeight }} dangerouslySetInnerHTML={{ __html: htmlContent }} onClick={(e) => { if(e.target.dataset.action === 'zoom') { e.stopPropagation(); setLightboxImg(e.target.src); } }} />
      </div>

      <div className={styles.footer}><div className={styles.progress} style={{ width: `${progress}%` }}></div></div>

      {lightboxImg && (
        <div className={styles.lightbox} onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }}>
          <img src={lightboxImg} alt="확대 이미지" />
        </div>
      )}
    </div>
  );
};

export default NovelViewerPage;