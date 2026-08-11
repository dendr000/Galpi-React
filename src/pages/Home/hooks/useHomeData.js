// 파일 위치: src/pages/Home/useHomeData.js
// 기능 요약: 위에서 분리된 3개의 서브 훅들을 가져와 통합하고, 기존과 동일한 반환 규격으로 HomePage.jsx에 전달하는 허브 역할로 전환되었습니다.
import { useHomeFetch } from './useHomeFetch';
import { useHomeFilter } from './useHomeFilter';
import { useHomeActions } from './useHomeActions';

export const useHomeData = () => {
  const { works, setWorks, characters, isLoading } = useHomeFetch();
  const { favWorks, toggleFav, toggleStatus } = useHomeActions({ works, setWorks });
  
  const filterHooks = useHomeFilter({ 
    works, 
    characters, 
    favWorks 
  });

  return {
    works,
    isLoading,
    favWorks,
    toggleFav,
    toggleStatus,
    ...filterHooks
  };
};