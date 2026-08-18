// src/domains/fab_tools/boilerplate/BoilerplateModal.jsx
import React, { useEffect } from 'react';
import ModalOverlay from '../../../components/common/ModalOverlay';
import { useModalStore } from '../../../store/useModalStore';
import { IconZap } from '../../components/FabIcons';

import { useBoilerplateData } from './hooks/useBoilerplateData';
import { useBoilerplateSearch } from './hooks/useBoilerplateSearch';

import BoilerplateHeader from './components/BoilerplateHeader';
import BoilerplateForm from './components/BoilerplateForm';
import BoilerplateBulkForm from './components/BoilerplateBulkForm';
import BoilerplateSearchBar from './components/BoilerplateSearchBar';
import BoilerplateList from './components/BoilerplateList';

const BoilerplateModal = ({ showToast }) => {
  const { closeModal } = useModalStore();
  const bpData = useBoilerplateData(showToast);
  const searchHooks = useBoilerplateSearch(bpData.bpList);

  useEffect(() => {
    const draftHtml = localStorage.getItem('galpi-draft-bp');
    const isEmptyRequest = localStorage.getItem('galpi-draft-bp-empty');

    if (draftHtml) {
      bpData.setBpInput(prev => ({ ...prev, content: draftHtml }));
      localStorage.removeItem('galpi-draft-bp');
      if (showToast) showToast("✅ 선택된 영역이 템플릿 본문으로 로드되었습니다.");
    } else if (isEmptyRequest) {
      bpData.setBpInput({ title: '', content: '' }); 
      localStorage.removeItem('galpi-draft-bp-empty');
    }
  }, [bpData.setBpInput, showToast]);

  return (
    <ModalOverlay 
      title={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconZap size={16} /> 스마트 상용구 관리 원장</span>} 
      onClose={closeModal} 
      width="600px"
    >
      <BoilerplateHeader bpData={bpData} clearSearch={searchHooks.clearSearch} />
      
      <BoilerplateForm bpData={bpData} />
      
      <BoilerplateBulkForm bpData={bpData} />
      
      <BoilerplateSearchBar 
        bpSearch={searchHooks.bpSearch} 
        setBpSearch={searchHooks.setBpSearch} 
        submitSearch={searchHooks.submitSearch} 
      />

      <BoilerplateList 
        submittedSearch={searchHooks.submittedSearch} 
        matchedList={searchHooks.matchedList} 
        handleBpEdit={bpData.handleBpEdit} 
        handleBpDelete={bpData.handleBpDelete} 
      />
    </ModalOverlay>
  );
};

export default BoilerplateModal;