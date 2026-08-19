// src/domains/fabTools/dict/utils/dictParser.js
export const parseBulkDict = (bulkText) => {
  const lines = bulkText.split('\n');
  const parsed = [];
  
  lines.forEach(line => {
    const match = line.trim().match(/^([^\(\)]+)\(([^\(\)]+)\)$/);
    if (match) {
      let key = match[1].trim(); 
      let val = match[2].trim();
      // 한글/한자 위치 스마트 스위칭 로직
      if (/[가-힣]/.test(val) && !/[가-힣]/.test(key)) { 
        key = match[2].trim(); 
        val = match[1].trim(); 
      }
      parsed.push({ word: key, translation: val });
    }
  });
  
  return parsed;
};