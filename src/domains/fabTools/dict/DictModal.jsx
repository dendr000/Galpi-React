// src/domains/fabTools/dict/DictModal.jsx
import React from 'react';
import ModalOverlay from '../../../components/common/ModalOverlay';
import { useModalStore } from '../../../store/useModalStore';
import { IconBook } from '../components/FabIcons';

import { useDictData } from './hooks/useDictData';
import { useDictSearch } from './hooks/useDictSearch';

import DictForm from './components/DictForm';
import DictBulkForm from './components/DictBulkForm';
import DictSearchBar from './components/DictSearchBar';
import DictTable from './components/DictTable';

const DictModal = ({ showToast }) => {
  const { closeModal } = useModalStore();

  // 검색어 입력 및 서버사이드 검색 훅 (사전은 작품 구분 없는 전역 단일 사전)
  const searchHooks = useDictSearch();

  // 데이터 조작 및 API 통신 훅 (저장/수정/삭제 성공 시 현재 검색 결과를 다시 불러옴)
  const dataHooks = useDictData({ showToast, onDataChanged: searchHooks.refreshSearch });

  return (
    <ModalOverlay 
      title={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconBook size={16} /> 고유명사 한자/영문 사전</span>} 
      onClose={closeModal} 
      width="550px"
    >
      <DictForm 
        dictInput={dataHooks.dictInput}
        setDictInput={dataHooks.setDictInput}
        editingTarget={dataHooks.editingTarget}
        handleDictSave={dataHooks.handleDictSave}
        handleCancelEdit={dataHooks.handleCancelEdit}
        isDictBulkMode={dataHooks.isDictBulkMode}
        setIsDictBulkMode={dataHooks.setIsDictBulkMode}
      />
      
      {dataHooks.isDictBulkMode && (
        <DictBulkForm 
          dictBulk={dataHooks.dictBulk}
          setDictBulk={dataHooks.setDictBulk}
          handleDictBulk={dataHooks.handleDictBulk}
        />
      )}
      
      <DictSearchBar 
        dictSearch={searchHooks.dictSearch}
        setDictSearch={searchHooks.setDictSearch}
        submitSearch={searchHooks.submitSearch}
      />
      
      <DictTable
        filteredList={searchHooks.filteredList}
        submittedSearch={searchHooks.submittedSearch}
        isSearching={searchHooks.isSearching}
        handleEditClick={dataHooks.handleEditClick}
        handleDelete={dataHooks.handleDelete}
      />
    </ModalOverlay>
  );
};

export default DictModal;