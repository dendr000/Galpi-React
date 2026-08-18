```bash
dict/
 ├── utils/
 │   ├── dictParser.js      # 벌크 매크로 텍스트 정규식 파싱 엔진
 │   └── dictStyles.js      # 인풋 및 공통 UI 스타일 객체
 ├── hooks/
 │   ├── useDictData.js     # 사전 데이터 CRUD 및 API 통신 전담 훅
 │   └── useDictSearch.js   # 엔터(Enter) 기반 지연 렌더링 검색 엔진 훅
 ├── components/
 │   ├── DictForm.jsx       # 단건 추가 및 수정 입력 폼 UI
 │   ├── DictBulkForm.jsx   # 다량 등록(벌크 덤프) 텍스트 영역 UI
 │   ├── DictSearchBar.jsx  # 검색어 입력 바 UI
 │   └── DictTable.jsx      # 사전 데이터 리스트 렌더링 및 삭제 제어 테이블 UI
 └── DictModal.jsx          # 위 8개의 모듈을 조립하는 최종 관제탑 래퍼
```