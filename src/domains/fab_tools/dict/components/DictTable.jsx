import React from 'react';
import { IconEdit, IconTrash } from '../../components/FabIcons';

const DictTable = ({ filteredList, submittedSearch, handleEditClick, handleDelete }) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', maxHeight: '300px' }}>
      <table className="bulk-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
        <thead style={{ background: 'var(--table-bg-alt)', position: 'sticky', top: 0, zIndex: 2 }}>
          <tr>
            <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}>원문 문자열</th>
            <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}>치환용 데이터</th>
            <th style={{padding:'10px', borderBottom:'1px solid var(--border-color)', width:'80px', color: 'var(--text-primary)'}}>관리</th>
          </tr>
        </thead>
        <tbody>
          {submittedSearch.trim() === '' ? (
            <tr>
              <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                검색어를 입력하고 Enter 키를 누르면 결과가 출력됩니다.
              </td>
            </tr>
          ) : filteredList.length > 0 ? (
            filteredList.map((d, i) => (
              <tr key={i}>
                <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)', color: 'var(--text-primary)'}}><b>{d.word}</b></td>
                <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)', color:'var(--primary-color)', fontWeight:'bold'}}>{d.translation}</td>
                <td style={{padding:'8px', borderBottom:'1px solid var(--border-color)'}}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button onClick={() => handleEditClick(d)} style={{ border:'none', background:'none', color:'var(--text-secondary)', cursor:'pointer', padding: 0 }} title="수정"><IconEdit size={15} /></button>
                    <button onClick={() => handleDelete(d)} style={{ border:'none', background:'none', color:'#e53e3e', cursor:'pointer', padding: 0 }} title="삭제"><IconTrash size={15} /></button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                일치하는 검색 결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DictTable;