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

const DictModal = ({ currentWorkId, showToast, globalDictList, setGlobalDictList }) => {
  const { closeModal } = useModalStore();
  
  // 데이터 조작 및 API 통신 훅
  const dataHooks = useDictData({ currentWorkId, showToast, globalDictList, setGlobalDictList });
  
  // 검색어 입력 및 필터링 훅
  const searchHooks = useDictSearch(globalDictList);

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
        handleEditClick={dataHooks.handleEditClick}
        handleDelete={dataHooks.handleDelete}
      />
    </ModalOverlay>
  );
};

export default DictModal;