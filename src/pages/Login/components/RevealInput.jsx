// 파일 위치: src/pages/Login/components/RevealInput.jsx
// 기능 요약: 4개 로그인 시안이 공유하는 통과 문구 입력 패널. 순서가 맞아서 revealed가 되면
// 나타나고, 테마별 생김새는 부모가 넘겨주는 style 객체들로만 다르게 입힌다.
import React, { useState } from 'react';

const RevealInput = ({ visible, error, submitting, onSubmit, wrapStyle, panelStyle, captionStyle, caption, inputStyle }) => {
  const [value, setValue] = useState('');

  return (
    <div style={{
      position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) scale(${visible ? 1 : 0.92})`,
      opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(.2,.9,.3,1.15)',
      zIndex: 30, width: 'min(360px,84vw)', textAlign: 'center', ...wrapStyle
    }}>
      <div style={panelStyle}>
        <div style={{ fontSize: '11.5px', letterSpacing: '0.08em', marginBottom: '10px', opacity: 0.8, ...captionStyle }}>{caption}</div>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(value); }}
          placeholder="passphrase"
          autoFocus={visible}
          autoComplete="off"
          disabled={submitting}
          style={{ width: '100%', boxSizing: 'border-box', outline: 'none', ...inputStyle }}
        />
        {error && <div style={{ color: '#ff6b6b', fontSize: '11px', marginTop: '10px', fontWeight: 'bold' }}>{error}</div>}
      </div>
    </div>
  );
};

export default RevealInput;
