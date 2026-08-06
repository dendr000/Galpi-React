// 파일 위치: src/domains/memo/components/MemoTableControlBar.jsx
// 기능 요약: 표(Table) 내부에 커서가 위치할 때 활성화되는 행/열 추가, 삭제 및 셀 정렬, 배경색 제어 패널입니다.

import React from 'react';
import {
  RowPlusIcon, ColPlusIcon, RowMinusIcon, ColMinusIcon,
  AlignLeftIcon, AlignCenterIcon, AlignRightIcon,
  HeadingToggleIcon, WidthFitIcon, TrashIcon
} from './MemoIcons';

const MemoTableControlBar = ({
  addTableRowBelow, addTableColRight, delTableRow, delTableCol,
  setCellAlign, toggleHeaderRow, setCellBgColor, toggleTableWidth, delTable
}) => {
  const PASTEL_COLORS = [
    { label: '지우기', val: 'transparent', bg: '#f1f3f5' },
    { label: '노랑', val: '#fff3bf', bg: '#fff3bf' },
    { label: '주황', val: '#ffe8cc', bg: '#ffe8cc' },
    { label: '핑크', val: '#ffb8b8', bg: '#ffb8b8' },
    { label: '보라', val: '#e5dbff', bg: '#e5dbff' },
    { label: '파랑', val: '#d0ebff', bg: '#d0ebff' },
    { label: '초록', val: '#d3f9d8', bg: '#d3f9d8' }
  ];

  const btnStyle = { padding: '4px 8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' };
  const iconBtnStyle = { ...btnStyle, padding: '4px 6px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="wiki-btn" onClick={addTableRowBelow} style={btnStyle} title="아래에 행 추가">
          <RowPlusIcon /> 행 추가
        </button>
        <button className="wiki-btn" onClick={addTableColRight} style={btnStyle} title="우측에 열 추가">
          <ColPlusIcon /> 열 추가
        </button>
        <button className="wiki-btn" onClick={delTableRow} style={{ ...btnStyle, color: '#e53e3e', borderColor: 'rgba(229,62,62,0.3)' }} title="현재 행 삭제">
          <RowMinusIcon /> 행 삭제
        </button>
        <button className="wiki-btn" onClick={delTableCol} style={{ ...btnStyle, color: '#e53e3e', borderColor: 'rgba(229,62,62,0.3)' }} title="현재 열 삭제">
          <ColMinusIcon /> 열 삭제
        </button>
        
        <div style={{ width: '1px', height: '14px', background: 'var(--border-color)', margin: '0 4px' }}></div>
        
        <button className="wiki-btn" onClick={() => setCellAlign('left')} title="왼쪽 정렬" style={iconBtnStyle}>
          <AlignLeftIcon />
        </button>
        <button className="wiki-btn" onClick={() => setCellAlign('center')} title="가운데 정렬" style={iconBtnStyle}>
          <AlignCenterIcon />
        </button>
        <button className="wiki-btn" onClick={() => setCellAlign('right')} title="오른쪽 정렬" style={iconBtnStyle}>
          <AlignRightIcon />
        </button>
        
        <div style={{ width: '1px', height: '14px', background: 'var(--border-color)', margin: '0 4px' }}></div>
        
        <button className="wiki-btn" onClick={toggleHeaderRow} title="제목 행 속성으로 변경/해제" style={btnStyle}>
          <HeadingToggleIcon /> 제목행 토글
        </button>
        <button className="wiki-btn" onClick={toggleTableWidth} title="100% 꽉 채우기 / 내용 너비 맞춤" style={btnStyle}>
          <WidthFitIcon /> 너비 맞춤
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>배경색:</span>
        {PASTEL_COLORS.map((c) => (
          <button 
            key={c.label} title={c.label} onClick={() => setCellBgColor(c.val)}
            style={{ width: '16px', height: '16px', background: c.bg, border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer', padding: 0 }}
          />
        ))}
        <button className="wiki-btn" onClick={delTable} style={{ ...btnStyle, background: '#e53e3e', color: 'white', borderColor: '#e53e3e', marginLeft: 'auto' }} title="표 완전히 지우기">
          <TrashIcon /> 표 완전히 지우기
        </button>
      </div>
    </div>
  );
};

export default MemoTableControlBar;