// 파일 위치: src/domains/memo/page/canvas/PageMemoCanvasBoard.jsx
// 기능 요약: 화살표(Edge) 선택 시 렌더링되는 속성 편집 패널 및 태그 필터링 훅 연동
// 버전: v2.1.0

import React, { useState, useCallback, useEffect } from 'react';
import { 
  ReactFlow, Controls, Background, MiniMap,
  applyNodeChanges, applyEdgeChanges, addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import api from '../../../../api/axiosCore';

import PageMemoNode from './PageMemoNode';
import PageMemoEdge from './PageMemoEdge';

const nodeTypes = { memoNode: PageMemoNode };
const edgeTypes = { relation: PageMemoEdge };

const PageMemoCanvasBoard = ({ 
  filteredMemos, setMemos, 
  relations, setRelations, 
  handleOpenEditor, setSelectedTag 
}) => {
  console.log("[PageMemoCanvasBoard] React Flow 캔버스 엔진 마운트 및 화살표 편집기 활성화");

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [rfInstance, setRfInstance] = useState(null);
  
  // 현재 선택된 화살표 ID 추적 상태
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  const handleToggleLock = async (memo) => {
    const newStatus = !memo.isLocked;
    const updatedMemo = { ...memo, isLocked: newStatus, updatedAt: Date.now() };
    setMemos(prev => prev.map(m => m.id === memo.id ? updatedMemo : m));
    try { await api.put(`/api/memos/${memo.id}`, updatedMemo); } catch(e){}
  };

  const handleMoveToTrash = async (memo) => {
    if(!window.confirm(`'${memo.title}' 메모를 휴지통으로 이동하시겠습니까?`)) return;
    const updatedMemo = { ...memo, isTrash: true, updatedAt: Date.now() };
    setMemos(prev => prev.map(m => m.id === memo.id ? updatedMemo : m));
    try { await api.put(`/api/memos/${memo.id}`, updatedMemo); } catch(e){}
  };

  useEffect(() => {
    const newNodes = filteredMemos.map(m => ({
      id: String(m.id),
      type: 'memoNode',
      position: { x: m.canvasX ?? 2500, y: m.canvasY ?? 2500 },
      dragHandle: '.custom-drag-handle',
      draggable: !m.isLocked,
      data: { memo: m, onEdit: handleOpenEditor, onToggleLock: handleToggleLock, onMoveToTrash: handleMoveToTrash, onTagClick: setSelectedTag }
    }));
    setNodes(newNodes);

    const newEdges = relations.map(r => ({
      id: String(r.id),
      source: String(r.sourceId),
      target: String(r.targetId),
      label: r.label,
      type: 'relation',
      data: { type: r.type, descRev: r.descRev }
    }));
    setEdges(newEdges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredMemos, relations]);

  const onNodeDragStop = async (event, node) => {
    const updatedX = Math.round(node.position.x);
    const updatedY = Math.round(node.position.y);
    const targetMemo = filteredMemos.find(m => String(m.id) === node.id);
    
    if (targetMemo && (targetMemo.canvasX !== updatedX || targetMemo.canvasY !== updatedY)) {
      const payload = { ...targetMemo, canvasX: updatedX, canvasY: updatedY };
      setMemos(prev => prev.map(m => String(m.id) === node.id ? payload : m));
      try { await api.put(`/api/memos/${node.id}`, payload); } catch(e){}
    }
  };

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = async (params) => {
    const payload = {
      sourceId: Number(params.source),
      targetId: Number(params.target),
      label: '관계',
      type: '->',
      descRev: ''
    };
    
    try {
      const res = await api.post('/api/memo-relations', payload);
      setRelations(prev => [...prev, res.data]);
    } catch(e) {
      console.error("관계망 연결 실패", e);
    }
  };

  // 선 선택 감지 이벤트 훅
  const onSelectionChange = useCallback(({ edges }) => {
    setSelectedEdgeId(edges.length > 0 ? edges[0].id : null);
  }, []);

  const onEdgesDelete = async (edgesToDelete) => {
    const idsToDelete = edgesToDelete.map(e => e.id);
    try {
      await Promise.all(idsToDelete.map(id => api.delete(`/api/memo-relations/${id}`)));
      setRelations(prev => prev.filter(r => !idsToDelete.includes(String(r.id))));
      setSelectedEdgeId(null);
    } catch (e) { console.error("관계망 삭제 통신 실패", e); }
  };

  // 화살표 속성 실시간 수정 로직 (DB 연동)
  const handleEdgeUpdate = async (field, value) => {
    const targetEdge = edges.find(e => e.id === selectedEdgeId);
    if (!targetEdge) return;

    const updatedLabel = field === 'label' ? value : targetEdge.label;
    const updatedType = field === 'type' ? value : targetEdge.data?.type;
    const updatedDescRev = field === 'descRev' ? value : targetEdge.data?.descRev;

    setEdges(eds => eds.map(e => e.id === selectedEdgeId ? {
      ...e, label: updatedLabel, data: { ...e.data, type: updatedType, descRev: updatedDescRev }
    } : e));

    const relationObj = relations.find(r => String(r.id) === selectedEdgeId);
    if (relationObj) {
      const payload = { ...relationObj, label: updatedLabel, type: updatedType, descRev: updatedDescRev };
      setRelations(prev => prev.map(r => String(r.id) === selectedEdgeId ? payload : r));
      try { await api.put(`/api/memo-relations/${selectedEdgeId}`, payload); } catch(e){}
    }
  };

  const activeEdge = edges.find(e => e.id === selectedEdgeId);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
        <defs>
          <marker id="memo-arr-normal" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-secondary)" />
          </marker>
          <marker id="memo-arr-active" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary-color)" />
          </marker>
        </defs>
      </svg>

      {/* 속성 편집기 패널 (선택된 선이 있을 때만 플로팅 마운트) */}
      {activeEdge && (
        <div style={{ position: 'absolute', top: '20px', right: '20px', width: '240px', padding: '15px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 10 }}>
          <div style={{ fontWeight: 900, color: 'var(--primary-color)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: '13px' }}>⚙️ 연결선 속성 편집</div>

          <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>관계 기술 (정방향 ➔)</label>
          <input type="text" style={{ width: '100%', padding: '6px', fontSize: '12px', marginBottom: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', boxSizing: 'border-box' }} value={activeEdge.label || ''} onChange={e => handleEdgeUpdate('label', e.target.value)} />

          {activeEdge.data?.type === '<->' && (
            <>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#e53e3e', display: 'block', marginBottom: '4px' }}>관계 기술 (역방향 ⬅)</label>
              <input type="text" style={{ width: '100%', padding: '6px', fontSize: '12px', marginBottom: '10px', border: '1px solid #e53e3e', borderRadius: '4px', boxSizing: 'border-box' }} value={activeEdge.data?.descRev || ''} onChange={e => handleEdgeUpdate('descRev', e.target.value)} />
            </>
          )}

          <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>선 종류 결정</label>
          <select style={{ width: '100%', padding: '6px', fontSize: '12px', marginBottom: '15px', border: '1px solid var(--border-color)', borderRadius: '4px', boxSizing: 'border-box' }} value={activeEdge.data?.type || '->'} onChange={e => handleEdgeUpdate('type', e.target.value)}>
            <option value="->">단방향 화살표 (➔)</option>
            <option value="<->">양방향 화살표 (⇄)</option>
            <option value="--">종속/연결 점선 (╌)</option>
          </select>

          <button className="wiki-btn" style={{ width: '100%', padding: '8px', fontSize: '12px', background: 'transparent', border: '1px solid #e53e3e', color: '#e53e3e', borderRadius: '4px' }} onClick={() => onEdgesDelete([activeEdge])}>
            ✖ 연결선 제거
          </button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onSelectionChange={onSelectionChange}
        onNodeDragStop={onNodeDragStop}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={{ x: -1500, y: -1500, zoom: 1 }}
        minZoom={0.2}
        maxZoom={3}
      >
        <Background color="var(--border-color)" gap={20} size={2} />
        <Controls style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
        <MiniMap 
          nodeColor={(n) => n.data?.memo?.themeColor || '#e2e8f0'}
          maskColor="rgba(0,0,0,0.1)"
          style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}
        />
      </ReactFlow>
    </div>
  );
};

export default PageMemoCanvasBoard;