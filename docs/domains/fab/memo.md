memo
├── components/                            # [사이드바 및 에디터 하위 UI 컴포넌트]
│   ├── MemoContextMenu.jsx                # 메모 및 폴더 제어용 우클릭/더보기 컨텍스트 팝업 메뉴
│   ├── MemoEditorBody.jsx                 # ContentEditable 기반의 실제 텍스트 입력 및 DOM 렌더링 구역
│   ├── MemoFootnotePopover.jsx            # 각주 마우스 호버(뷰 모드) 및 클릭(편집/삭제 모드) 제어용 팝오버
│   ├── MemoIcons.jsx                      # 메모장 전역에서 사용되는 범용 SVG 벡터 아이콘 모음집
│   ├── MemoLinkPopover.jsx                # 드래그한 텍스트에 내부 하이퍼링크를 삽입하거나 수정하는 모달
│   ├── MemoSmartFolders.jsx               # '최근 7일', '미분류' 등 동적 필터링을 제공하는 가상 스마트 폴더 UI
│   ├── MemoTagBar.jsx                     # 에디터 최하단에서 태그를 입력하고 파란색 알약(Pill) 형태로 보여주는 UI
│   ├── MemoTagExplorer.jsx                # 사이드바 하단에서 사용된 태그 빈도를 집계하여 보여주는 탐색기 아코디언
│   └── TagSearchModal.jsx                 # 특정 태그 클릭 시 해당 태그가 포함된 메모 리스트를 중앙에 띄워주는 검색 모달
│
├── hooks/                                 # [비즈니스 로직 및 상태 관리 커스텀 훅]
│   ├── events/                            # [정밀 DOM 마우스/키보드 이벤트 훅]
│   │   ├── useMemoSelection.js            # 브라우저 기본 Ctrl+A 폭주를 막는 표/아코디언 정밀 스캐너 및 복사 격리 로직
│   │   └── useMemoTableNav.js             # 표 내부에서 Tab/Enter로 엑셀처럼 셀을 이동하는 스마트 네비게이션 로직
│   │
│   ├── useMemoBlockDrag.js                # 표, 아코디언 좌측에 드래그 핸들([⋮⋮])을 띄우고 블록 단위로 순서를 변경하는 물리 엔진
│   ├── useMemoEditor.js                   # 에디터 관련 하위 훅들을 모두 결합하여 UI 컨테이너에 주입하는 중앙 관제탑(Hub) 훅
│   ├── useMemoEvents.js                   # 단축키(저장, 각주 등), 라우팅 차단 및 스위칭(SPA 이동)을 관장하는 전역 DOM 이벤트 훅
│   ├── useMemoFindReplace.js              # 에디터 본문 내 특정 문자열을 찾아 일괄 치환(Find/Replace)하는 훅
│   ├── useMemoFolder.js                   # 폴더 생성, 이름 변경, 삭제(기타 폴더 연쇄 이관) 및 로컬/DB 동기화 전담 훅
│   ├── useMemoFootnote.js                 # CSS 카운터 기반 각주 마커 주입 및 모달 뷰/편집 모드 전환 제어 훅
│   ├── useMemoFormat.js                   # 볼드, 기울임, 템플릿 삽입 등 HTML 기반(execCommand) 텍스트 포맷 제어 훅
│   ├── useMemoLink.js                     # Selection API(Range)를 이용해 텍스트 좌표를 추적하고 링크를 주입/수정하는 로직
│   ├── useMemoMenu.js                     # 컨텍스트 메뉴 좌표 계산 및 외부 클릭 닫힘, 폴더 간 이동 로직 전담 훅
│   ├── useMemoSave.js                     # 작성된 본문과 추출된 태그를 직렬화하여 백엔드 DB(Axios)와 통신하는 저장 전담 훅
│   ├── useMemoSidebar.js                  # 사이드바 내의 폴더 트리, 정렬, 태그 검색 등 여러 훅을 조립하는 허브 훅
│   ├── useMemoSortAndDrag.js              # 셀렉트 박스(이름순/최신순) 및 전역 태그(selectedTag) 기반의 교차 필터링 상태 관리 훅
│   ├── useMemoTableCtrl.js                # 표 내부 포커스 감지, 행/열/표 추가 및 삭제(Ctrl+Z 히스토리 보존) 로직 제어 훅
│   ├── useMemoTags.js                     # 메모 전체 데이터를 순회하여 태그 빈도수를 집계하고 내림차순 정렬하는 연산 훅
│   └── useMemoTree.js                     # 다중 계층 폴더 트리의 접힘/펼침(isExpanded) 상태를 독립적으로 기억하는 훅
│
├── utils/                                 # [순수 자바스크립트 유틸리티]
│   └── memoTreeUtils.js                   # 평면적 폴더 배열과 메모를 순회하여 슬래시(/) 기반 계층형 깊이(Depth) 트리를 빌드하는 파서
│
├── FabMemoWidget.jsx                      # 우측 하단 플로팅 액션 버튼(FAB) 형태의 메모장 위젯 메인 컨트롤러 및 최상위 레이아웃
├── MemoEditor.jsx                         # 메모장 리치 텍스트 에디터 메인 컨테이너 (훅 조립 및 서브 컴포넌트 렌더링)
├── MemoEditorHeader.jsx                   # 에디터 상단 헤더 UI (제목 입력, 글자 수 통계, 저장 상태 표기, 페이지 이동 버튼)
├── MemoFormatBar.jsx                      # 텍스트 서식, 표 제어, 찾아 바꾸기 등의 기능을 수행하는 상단 고정 툴바 UI
├── MemoModal.jsx                          # 화면 전체를 덮는 확장형 및 중앙 팝업형 메모장 모달 전용 래퍼 컨테이너
└── MemoSidebar.jsx                        # 좌측 메모 탐색기 래퍼 (폴더 트리, 스마트 폴더, 태그 탐색기 등 조립)