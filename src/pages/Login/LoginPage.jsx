// 파일 위치: src/pages/Login/LoginPage.jsx
// 기능 요약: 시크릿 게이트 진입점. 4개 시안 중 하나를 매번 무작위로 골라 보여준다.
import React, { useState } from 'react';
import { useLoginSequence } from './hooks/useLoginSequence';
import LibraryScene from './components/LibraryScene';
import StarChartScene from './components/StarChartScene';
import TerminalScene from './components/TerminalScene';
import TraceScene from './components/TraceScene';

const THEMES = [
  { key: 'library', Scene: LibraryScene },
  { key: 'starchart', Scene: StarChartScene },
  { key: 'terminal', Scene: TerminalScene },
  { key: 'trace', Scene: TraceScene },
];

const LoginPage = () => {
  const [picked] = useState(() => THEMES[Math.floor(Math.random() * THEMES.length)]);
  const { revealed, error, submitting, hitIndex, submitPassphrase } = useLoginSequence(picked.key);
  const Scene = picked.Scene;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <Scene onHit={hitIndex} revealed={revealed} error={error} submitting={submitting} onSubmit={submitPassphrase} />
    </div>
  );
};

export default LoginPage;
