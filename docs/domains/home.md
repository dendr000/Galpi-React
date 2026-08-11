```bash
src/
 ├── components/
 │    └── common/
 │         └── icons/
 │              └── DomainIcons.jsx      (공통 SVG 아이콘 팩)
 ├── pages/
 │    ├── Home/
 │    │    ├── hooks/
 │    │    │    ├── useHomeFetch.js      (통신 및 파싱 훅)
 │    │    │    ├── useHomeFilter.js     (다중 검색/정렬 훅)
 │    │    │    └── useHomeActions.js    (상태 변경 액션 훅)
 │    │    ├── useHomeData.js            (하위 훅 조립 래퍼)
 │    │    ├── HomePage.jsx              (SVG 아이콘 적용)
 │    │    └── WorkCard.jsx              (SVG 아이콘 적용)
 │    └── Category/
 │         ├── hooks/
 │         │    └── useCategoryData.js   (분류 연산 비즈니스 훅)
 │         ├── components/
 │         │    ├── CategoryHeader.jsx   (상단 헤더 UI)
 │         │    ├── CategoryGrid.jsx     (분류 카드 격자 UI)
 │         │    └── CategoryWorkList.jsx (나무위키형 목차 UI)
 │         └── CategoryPage.jsx          (모듈 조립 메인 컨테이너)
```