```bash
boilerplate/
 ├── utils/
 │   └── boilerplateStyles.js       # 공통 Input UI 스타일 객체
 ├── hooks/
 │   ├── useBoilerplateSearch.js    # Enter 지연 검색 엔진 훅 (신규 분리)
 │   ├── useBoilerplateData.js      # (기존 파일 이동)
 │   ├── useBoilerplateCore.js      # (기존 파일 이동)
 │   └── useBoilerplateListener.js  # (기존 파일 이동)
 ├── components/
 │   ├── BoilerplateHeader.jsx      # 폴더 제어 및 환경설정 체크박스 UI
 │   ├── BoilerplateForm.jsx        # 단건 추가/수정 폼 UI
 │   ├── BoilerplateBulkForm.jsx    # 일괄 등록(벌크) 폼 UI
 │   ├── BoilerplateSearchBar.jsx   # 검색 바 UI
 │   ├── BoilerplateList.jsx        # 상용구 검색 결과 리스트 UI
 │   └── BoilerplateSuggestPopup.jsx# 실시간 추천 팝업 (기존 파일 이동)
 └── BoilerplateModal.jsx           # 조립 관제탑 래퍼
 ```