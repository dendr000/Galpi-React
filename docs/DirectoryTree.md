src/
 ├── App.jsx
 ├── main.jsx
 │
 ├── api/
 │   └── axiosCore.js
 │
 ├── assets/
 │   └── image.png
 │
 ├── store/                 # 전역 상태 관리
 │   ├── useAppStore.js
 │   ├── useModalStore.js
 │   └── useSettingStore.js
 │
 ├── styles/                # 전역 CSS 모음
 │   ├── bulk.css
 │   ├── category.css
 │   ├── edit.css
 │   ├── galpi.css
 │   ├── global.css
 │   ├── index.css
 │   ├── memo-page.css
 │   └── novel-viewer.css
 │
 ├── utils/                 # 순수 JS 유틸리티 함수 (JSX 파일 제외)
 │   ├── backlinkRouter.js
 │   └── markdownParser.js
 │
 ├── hooks/                 # 전역 커스텀 훅
 │   ├── useBacklinkRouter.js
 │   ├── useBossKey.js
 │   └── useHorizontalScroll.js
 │
 ├── components/            # 공통 UI 컴포넌트 껍데기
 │   ├── common/
 │   │   ├── BossBlindLayer.jsx
 │   │   ├── ModalOverlay.jsx
 │   │   └── SettingModal.jsx
 │   └── layout/
 │       ├── FabMenu.jsx
 │       ├── GlobalContextMenu.jsx
 │       └── Gnb.jsx
 │
 ├── domains/               # ★ 핵심 비즈니스 로직 및 기능별 묶음
 │   ├── work/
 │   │   ├── FloatingLeftTree.jsx
 │   │   ├── FloatingToc.jsx
 │   │   ├── InlineCategoryForm.jsx
 │   │   └── WorkCover.jsx
 │   ├── character/
 │   │   ├── BatchImageModal.jsx
 │   │   ├── CharacterInfobox.jsx
 │   │   └── useCharacterDrag.js     # 기존 WorkDetail/hooks 에서 이동
 │   ├── memo/
 │   │   ├── FabMemoWidget.jsx
 │   │   ├── FabMemoWidget.module.css
 │   │   ├── MemoEditor.jsx
 │   │   ├── MemoModal.jsx
 │   │   └── MemoSidebar.jsx
 │   ├── macro/
 │   │   ├── BarGraph.jsx
 │   │   ├── BarGraphViewer.jsx
 │   │   ├── BasicMacroTools.jsx
 │   │   ├── MacroToolbar.jsx
 │   │   ├── MacroToolbar.module.css
 │   │   ├── MarkdownRenderer.jsx    # utils 및 중복 폴더에서 단일 통합
 │   │   ├── MarkdownViewer.jsx
 │   │   ├── RadarChart.jsx
 │   │   ├── RadarChartViewer.jsx
 │   │   ├── RelationEditor.jsx
 │   │   ├── RelationGraph.jsx
 │   │   ├── Timeline.jsx
 │   │   └── TimelineViewer.jsx
 │   └── fab_tools/
 │       ├── BoilerplateModal.jsx
 │       ├── ClipboardModal.jsx
 │       ├── DictModal.jsx
 │       ├── RecentModal.jsx
 │       └── SearchModal.jsx
 │
 └── pages/                 # ★ 라우팅 엔드포인트 및 해당 페이지 전용 CSS
     ├── BulkStudio/
     │   ├── BulkStudio.module.css
     │   └── BulkStudioPage.jsx
     ├── Category/
     │   ├── Category.module.css
     │   └── CategoryPage.jsx
     ├── Editor/
     │   ├── EditorPage.jsx
     │   ├── EditorPage.module.css
     │   └── EditorSearch.jsx
     ├── Home/
     │   ├── Home.module.css
     │   └── HomePage.jsx            # 기존 Home.jsx 이름 통일
     ├── MemoWorkspace/
     │   ├── MemoWorkspace.module.css
     │   └── MemoWorkspacePage.jsx
     ├── NotFound/
     │   └── NotFoundPage.jsx
     ├── NovelViewer/
     │   ├── NovelViewer.module.css
     │   └── NovelViewerPage.jsx
     └── WorkDetail/
         ├── WorkDetail.module.css
         └── WorkDetailPage.jsx