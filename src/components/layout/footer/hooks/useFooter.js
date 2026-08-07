// 파일 위치: src/components/layout/footer/hooks/useFooter.js
import { useState } from 'react';

export const useFooter = () => {
  const [activeTool, setActiveTool] = useState(null);

  const toggleTool = (toolName) => {
    setActiveTool(prev => prev === toolName ? null : toolName);
  };

  const closeTool = () => {
    setActiveTool(null);
  };

  return {
    activeTool,
    toggleTool,
    closeTool
  };
};