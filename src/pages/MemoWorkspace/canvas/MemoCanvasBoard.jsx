// 파일 위치: src/pages/MemoWorkspace/canvas/MemoCanvasBoard.jsx
// 기능 요약: React Flow 라이브러리를 활용하여 미니맵, 줌, 패닝, 화살표 연결을 지원하는 무한 캔버스 보드 모듈
// 버전: v2.0.0

import React, { useState, useCallback, useEffect } from 'react';
import { 
  ReactFlow, Controls, Background, MiniMap,
  applyNodeChanges, applyEdgeChanges, addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import api from '../../../api/axiosCore';

import MemoNode from './MemoNode';
import MemoEdge from './MemoEdge';

const nodeTypes = { memoNode: MemoNode };
const edgeTypes = { relation: MemoEdge };

const MemoCanvasBoard = ({ 
  filteredMemos, setMemos, 
  relations, setRelations, 
  handleOpenEditor 
}) => {
  console.log("[MemoCanvasBoard] React Flow 캔버스 엔진 마운트");

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [rfInstance, setRfInstance] = useState(null);

  // 물리 메모 액션 (잠금 및 휴지통)
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

  // 상위 상태(memos, relations)가 변할 때마다 React Flow 상태(nodes, edges) 동기화
  useEffect(() => {
    const newNodes = filteredMemos.map(m => ({
      id: String(m.id),
      type: 'memoNode',
      position: { x: m.canvasX ?? 2500, y: m.canvasY ?? 2500 },
      dragHandle: '.custom-drag-handle',
      draggable: !m.isLocked,
      data: { memo: m, onEdit: handleOpenEditor, onToggleLock: handleToggleLock, onMoveToTrash: handleMoveToTrash }
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

  // 노드 드래그 종료 시 좌표 DB에 영구 저장
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

  // 노드 간 새로운 선 연결 시 DB 인서트
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

  // 선(Edge)을 선택하고 백스페이스/Delete 키로 삭제했을 때 DB 연동
  const onEdgesDelete = async (edgesToDelete) => {
    const idsToDelete = edgesToDelete.map(e => e.id);
    try {
      await Promise.all(idsToDelete.map(id => api.delete(`/api/memo-relations/${id}`)));
      setRelations(prev => prev.filter(r => !idsToDelete.includes(String(r.id))));
    } catch (e) {
      console.error("관계망 삭제 통신 실패", e);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* 엣지 화살촉 렌더링용 SVG 전역 주입 */}
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

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
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

export default MemoCanvasBoard;