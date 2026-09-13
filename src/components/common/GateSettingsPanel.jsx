// 파일 위치: src/components/common/GateSettingsPanel.jsx
// 기능 요약: 설정 > 보안 탭에서 시크릿 게이트(로그인 페이지) 4개 테마의 현재 정답을 사람이
// 읽을 수 있는 말로 보여주고, 원할 때 "다시 섞기"로 정답을 새로 뽑을 수 있게 하는 관리 패널.
// 이미 로그인된 사람만 여기 접근할 수 있으므로(AuthFilter가 /api/auth/current-answers도
// 세션 토큰을 요구함) 정답을 확인하는 행위 자체가 순환 논리가 아니다.
import React, { useEffect, useState } from 'react';
import api from '../../api/axiosCore';
import useAuthStore from '../../store/useAuthStore';
import { IconRestore } from './icons/DomainIcons';

// 각 시안의 격자 구조 — 로그인 화면 컴포넌트와 반드시 같은 값을 유지해야 힌트가 정확하다.
const GRID = {
  library: { rows: 3, cols: 8, unit: '번째 줄 · ', unit2: '번째 책' },
  starchart: { rows: 6, cols: 10, unit: '번째 줄 · ', unit2: '번째 별' },
  terminal: { rows: 1, cols: 8, unit: '', unit2: '번째 로그 줄' },
  trace: { rows: 1, cols: 7, unit: '', unit2: '번째 액자' },
};

const describe = (theme, idx) => {
  const g = GRID[theme];
  if (!g) return `#${idx}`;
  if (g.rows === 1) return `${idx + 1}${g.unit2}`;
  const row = Math.floor(idx / g.cols) + 1, col = (idx % g.cols) + 1;
  return `${row}${g.unit}${col}${g.unit2}`;
};

const GateSettingsPanel = () => {
  const [rows, setRows] = useState(null);
  const [rerollingTheme, setRerollingTheme] = useState(null);
  const logout = useAuthStore((s) => s.logout);

  const load = () => {
    api.get('/api/auth/current-answers').then(res => setRows(res.data)).catch(() => setRows([]));
  };
  useEffect(() => { load(); }, []);

  const handleReroll = async (theme) => {
    setRerollingTheme(theme);
    try {
      await api.post('/api/auth/reroll', { theme });
      load();
    } finally {
      setRerollingTheme(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        로그인 화면에서 어느 두 곳을 순서대로 더블클릭해야 하는지, 여기서만 확인할 수 있습니다.
        까먹었거나 새로 정하고 싶으면 "다시 섞기"를 누르세요.
      </div>

      {rows === null && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>불러오는 중...</div>}

      {rows?.map((r) => {
        let seq = [];
        try { seq = JSON.parse(r.answer || '[]'); } catch (e) {}
        return (
          <div key={r.theme} style={{ padding: '16px 18px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>{r.label}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                {seq.map((idx, i) => describe(r.theme, idx)).join('  →  ')}
              </div>
            </div>
            <button
              className="wiki-btn"
              onClick={() => handleReroll(r.theme)}
              disabled={rerollingTheme === r.theme}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '7px 12px', fontSize: '12px' }}
            >
              <IconRestore size={13} /> {rerollingTheme === r.theme ? '섞는 중...' : '다시 섞기'}
            </button>
          </div>
        );
      })}

      <div style={{ marginTop: '4px' }}>
        <button
          className="wiki-btn"
          onClick={logout}
          style={{ background: '#e53e3e', color: 'white', padding: '9px 16px', fontSize: '13px' }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default GateSettingsPanel;
