import { useState, useRef, useCallback } from 'react';
import { Upload, Database, FileSpreadsheet, Search, Sparkles, BarChart3, Check, Calculator, Wand2, Trash2, ArrowRight, X, Eye, Download, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

interface DataSourcesProps {
  onAnalyzeComplete?: (data: any) => void;
}

interface LocalFile {
  id: string;
  name: string;
  type: string;
  rows: number;
  columns: string[];
  data: Record<string, unknown>[];
  uploadedAt: Date;
  color: string;
  size: number;
}

const COLORS = ['emerald', 'blue', 'purple', 'pink', 'orange'];

// 데이터 미리보기 모달
function PreviewModal({ 
  file, 
  onClose 
}: { 
  file: LocalFile; 
  onClose: () => void;
}) {
  const [previewRows, setPreviewRows] = useState(10);
  
  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(file.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${file.name.replace(/\.[^/.]+$/, '')}_export.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-500">
                {file.rows.toLocaleString()} rows × {file.columns.length} columns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              다운로드
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="px-6 py-4 bg-gray-50 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{file.rows.toLocaleString()}</div>
            <div className="text-xs text-gray-500">총 행</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{file.columns.length}</div>
            <div className="text-xs text-gray-500">컬럼</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{file.type}</div>
            <div className="text-xs text-gray-500">형식</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatFileSize(file.size)}</div>
            <div className="text-xs text-gray-500">용량</div>
          </div>
        </div>
        
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                {file.columns.map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {file.data.slice(0, previewRows).map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                  {file.columns.map(col => (
                    <td key={col} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {Math.min(previewRows, file.rows)}개 표시 중 (전체 {file.rows.toLocaleString()}개)
          </span>
          {previewRows < file.rows && (
            <button
              onClick={() => setPreviewRows(prev => Math.min(prev + 50, file.rows))}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              더 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DataSources({ onAnalyzeComplete }: DataSourcesProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 로컬 파일 저장소
  const [localSources, setLocalSources] = useState<LocalFile[]>([]);
  
  // 모달 상태
  const [showActionModal, setShowActionModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<LocalFile | null>(null);

  const parseFile = useCallback(async (file: File): Promise<LocalFile | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
          const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
          
          resolve({
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.name.endsWith('.csv') ? 'CSV' : 'Excel',
            rows: jsonData.length,
            columns,
            data: jsonData,
            uploadedAt: new Date(),
            color: COLORS[localSources.length % COLORS.length],
            size: file.size,
          });
        } catch (err) {
          console.error('파일 파싱 오류:', err);
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsArrayBuffer(file);
    });
  }, [localSources.length]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);
    
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['xlsx', 'xls', 'csv'].includes(ext || '');
    });
    
    const parsedFiles: LocalFile[] = [];
    for (const file of validFiles) {
      const parsed = await parseFile(file);
      if (parsed) {
        parsedFiles.push(parsed);
      }
    }
    
    setLocalSources(prev => [...prev, ...parsedFiles]);
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredSources.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredSources.map(f => f.id));
    }
  };

  const handleDelete = (fileId: string) => {
    setLocalSources(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const handleDeleteSelected = () => {
    setLocalSources(prev => prev.filter(f => !selectedFiles.includes(f.id)));
    setSelectedFiles([]);
  };

  // 선택된 파일로 다른 기능 이동
  const handleNavigateToFeature = (feature: 'smart' | 'settlement' | 'analytics') => {
    const selectedData = localSources.filter(f => selectedFiles.includes(f.id));
    sessionStorage.setItem('selectedFiles', JSON.stringify(selectedData));
    
    setShowActionModal(false);
    navigate(`/${feature}`);
  };

  // AI 기반 데이터 분석
  const handleAnalyze = () => {
    const selectedData = localSources.filter(f => selectedFiles.includes(f.id));
    if (selectedData.length === 0) return;
    
    const file = selectedData[0];
    const numericCols = file.columns.filter(col => 
      file.data.some(row => typeof row[col] === 'number')
    );
    
    // === 숫자 컬럼별 통계 계산 ===
    const numericStats: Record<string, { 
      values: number[], mean: number, std: number, min: number, max: number,
      minRow: Record<string, unknown>, maxRow: Record<string, unknown>
    }> = {};
    
    numericCols.forEach(col => {
      const validRows = file.data.filter(row => typeof row[col] === 'number');
      const values = validRows.map(row => Number(row[col]));
      
      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        
        numericStats[col] = {
          values,
          mean,
          std,
          min: minVal,
          max: maxVal,
          minRow: validRows.find(row => Number(row[col]) === minVal) || {},
          maxRow: validRows.find(row => Number(row[col]) === maxVal) || {}
        };
      }
    });
    
    // 날짜 컬럼 찾기
    const dateCol = file.columns.find(c => 
      c.toLowerCase().includes('date') || c.toLowerCase().includes('time') || 
      c.toLowerCase() === '날짜' || c.toLowerCase().includes('일자')
    );
    
    // 카테고리 컬럼 찾기
    const categoryCol = file.columns.find(c => 
      c.toLowerCase().includes('category') || c.toLowerCase().includes('type') || 
      c.toLowerCase() === '카테고리' || c.toLowerCase().includes('분류')
    );
    
    // 주요 숫자 컬럼 (amount, price, value 등)
    const valueCol = file.columns.find(c => 
      c.toLowerCase().includes('amount') || c.toLowerCase().includes('price') || 
      c.toLowerCase().includes('value') || c.toLowerCase().includes('금액')
    ) || numericCols[0];
    
    // Excel 직렬화 번호를 날짜 문자열로 변환하는 함수
    const excelDateToString = (excelDate: number | string): string => {
      // 숫자인 경우 Excel 직렬화 번호로 간주
      if (typeof excelDate === 'number' || (typeof excelDate === 'string' && /^\d+$/.test(excelDate))) {
        const num = Number(excelDate);
        // Excel 날짜는 1900년 1월 1일부터 시작 (1 = 1900-01-01)
        // JavaScript Date는 1970년 1월 1일부터 시작
        if (num > 25569 && num < 50000) { // 1970년 ~ 2036년 범위
          const jsDate = new Date((num - 25569) * 86400 * 1000);
          return jsDate.toISOString().slice(0, 10); // YYYY-MM-DD
        }
      }
      // 이미 문자열 날짜인 경우
      return String(excelDate);
    };
    
    // === 개요 탭: AI 분석 인사이트 (1차 분석 - 실제 데이터 기반) ===
    const insights: string[] = [];
    
    // 기본 정보
    insights.push(`총 ${file.rows.toLocaleString()}건의 데이터를 분석했습니다.`);
    
    // 숫자 컬럼 통계
    if (valueCol && numericStats[valueCol]) {
      const stats = numericStats[valueCol];
      insights.push(
        `'${valueCol}' 컬럼: 최대 ${stats.max.toLocaleString()}, 최소 ${stats.min.toLocaleString()}, 평균 ${stats.mean.toLocaleString(undefined, { maximumFractionDigits: 1 })}`
      );
    }
    
    // 시계열 분석 - AI가 자동으로 최적의 기간 단위 선택
    let trendData: { name: string; value: number }[] = [];
    let periodLabel = '기간별';
    
    if (dateCol) {
      // 먼저 월별로 그룹핑해서 몇 개월 데이터인지 확인
      const monthGroups: Record<string, { count: number; sum: number }> = {};
      const dayGroups: Record<string, { count: number; sum: number }> = {};
      
      file.data.forEach(row => {
        const rawDate = row[dateCol];
        const dateStr = excelDateToString(rawDate as number | string);
        
        // 월별 그룹핑
        const monthPeriod = dateStr.slice(0, 7); // YYYY-MM
        if (monthPeriod && monthPeriod.length >= 4 && !monthPeriod.startsWith('und') && !monthPeriod.startsWith('nul')) {
          if (!monthGroups[monthPeriod]) {
            monthGroups[monthPeriod] = { count: 0, sum: 0 };
          }
          monthGroups[monthPeriod].count += 1;
          if (valueCol && typeof row[valueCol] === 'number') {
            monthGroups[monthPeriod].sum += Number(row[valueCol]);
          }
        }
        
        // 일별 그룹핑
        const dayPeriod = dateStr.slice(0, 10); // YYYY-MM-DD
        if (dayPeriod && dayPeriod.length >= 10 && !dayPeriod.startsWith('und') && !dayPeriod.startsWith('nul')) {
          if (!dayGroups[dayPeriod]) {
            dayGroups[dayPeriod] = { count: 0, sum: 0 };
          }
          dayGroups[dayPeriod].count += 1;
          if (valueCol && typeof row[valueCol] === 'number') {
            dayGroups[dayPeriod].sum += Number(row[valueCol]);
          }
        }
      });
      
      const monthCount = Object.keys(monthGroups).length;
      const dayCount = Object.keys(dayGroups).length;
      
      // AI 자동 선택: 월이 1~2개면 일별, 그 외에는 월별
      let selectedGroups: Record<string, { count: number; sum: number }>;
      if (monthCount <= 2 && dayCount > 1) {
        selectedGroups = dayGroups;
        periodLabel = '일별';
      } else {
        selectedGroups = monthGroups;
        periodLabel = '월별';
      }
      
      const sortedPeriods = Object.entries(selectedGroups).sort((a, b) => b[1].count - a[1].count);
      if (sortedPeriods.length > 0) {
        const [peakPeriod, peakData] = sortedPeriods[0];
        insights.push(`데이터가 가장 많은 시점: ${peakPeriod} (${peakData.count.toLocaleString()}건)`);
        
        // 시계열 트렌드 데이터 생성
        trendData = Object.entries(selectedGroups)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-15) // 최대 15개 포인트
          .map(([name, data]) => ({ 
            name: periodLabel === '일별' ? name.slice(5) : name, // 일별이면 MM-DD로 표시
            value: valueCol && data.sum > 0 ? data.sum : data.count 
          }));
      }
    }
    
    // 카테고리 분포
    if (categoryCol) {
      const catGroups: Record<string, number> = {};
      file.data.forEach(row => {
        const cat = String(row[categoryCol] || 'Unknown');
        catGroups[cat] = (catGroups[cat] || 0) + 1;
      });
      
      const sortedCats = Object.entries(catGroups).sort((a, b) => b[1] - a[1]);
      const topCats = sortedCats.slice(0, 3);
      if (topCats.length > 0) {
        const catStr = topCats.map(([cat, cnt]) => 
          `'${cat}' (${cnt}건, ${(cnt / file.rows * 100).toFixed(1)}%)`
        ).join(', ');
        insights.push(`상위 카테고리: ${catStr}`);
      }
    }
    
    // 데이터 품질
    const nullCount = file.columns.reduce((sum, col) => 
      sum + file.data.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length, 0
    );
    if (nullCount > 0) {
      const nullPct = (nullCount / (file.rows * file.columns.length) * 100).toFixed(1);
      insights.push(`결측치: ${nullCount.toLocaleString()}건 (${nullPct}%)`);
    }
    
    // trendData가 없으면 기본 생성
    if (trendData.length === 0) {
      trendData = Array.from({ length: 6 }, (_, i) => ({
        name: `${i + 1}월`,
        value: Math.floor(Math.random() * 100) + 50,
      }));
    }
    
    const kpiMetrics = [
      { label: '총 건수', value: file.rows.toLocaleString(), color: 'blue' },
      { label: '컬럼 수', value: file.columns.length.toString(), color: 'purple' },
      { label: '숫자 컬럼', value: numericCols.length.toString(), color: 'emerald' },
      { label: '파일 크기', value: formatFileSize(file.size), color: 'orange' },
    ];
    
    // === 가공 탭: 2차 분석 데이터 ===
    
    // 가공 제안
    const transformSuggestions: { title: string; description: string; priority: string; color: string }[] = [];
    
    if (nullCount > 0) {
      transformSuggestions.push({
        title: '결측치 처리',
        description: `${nullCount.toLocaleString()}건의 결측치가 있습니다. 평균값 대체 또는 행 삭제를 권장합니다.`,
        priority: 'high',
        color: 'red'
      });
    }
    
    if (dateCol) {
      transformSuggestions.push({
        title: '시간 파생 변수',
        description: `'${dateCol}'에서 요일, 월, 분기 파생 변수를 생성하면 시간 패턴 분석이 가능합니다.`,
        priority: 'medium',
        color: 'emerald'
      });
    }
    
    if (categoryCol) {
      const uniqueCats = new Set(file.data.map(row => row[categoryCol])).size;
      if (uniqueCats > 10) {
        transformSuggestions.push({
          title: '카테고리 그룹화',
          description: `'${categoryCol}'에 ${uniqueCats}개 고유값이 있습니다. 상위 그룹으로 통합하면 분석이 용이합니다.`,
          priority: 'low',
          color: 'purple'
        });
      }
    }
    
    // 앞으로의 예측
    const futurePredictions: { title: string; description: string; confidence: string; trend: string }[] = [];
    
    if (trendData.length >= 3 && valueCol) {
      const values = trendData.map(t => t.value);
      const n = values.length;
      const xMean = (n - 1) / 2;
      const yMean = values.reduce((a, b) => a + b, 0) / n;
      
      let num = 0, den = 0;
      values.forEach((y, x) => {
        num += (x - xMean) * (y - yMean);
        den += (x - xMean) ** 2;
      });
      const slope = den !== 0 ? num / den : 0;
      const trendDir = slope > 0 ? '증가' : slope < 0 ? '감소' : '유지';
      const nextVal = yMean + slope * n;
      const pctChange = yMean !== 0 ? ((nextVal - yMean) / yMean * 100).toFixed(1) : '0';
      
      futurePredictions.push({
        title: '다음 기간 예측',
        description: `현재 ${trendDir} 추세입니다. 다음 기간 예상: ${nextVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}건 (${Number(pctChange) > 0 ? '+' : ''}${pctChange}%)`,
        confidence: Math.abs(slope) > 5 ? '75%' : '60%',
        trend: trendDir
      });
    }
    
    // AI가 주목한 포인트 (심층 분석)
    const aiFocusPoints: { title: string; description: string; type: string; severity: string }[] = [];
    
    // 이상치 탐지
    if (valueCol && numericStats[valueCol]) {
      const stats = numericStats[valueCol];
      const sortedVals = [...stats.values].sort((a, b) => a - b);
      const q1 = sortedVals[Math.floor(sortedVals.length * 0.25)];
      const q3 = sortedVals[Math.floor(sortedVals.length * 0.75)];
      const iqr = q3 - q1;
      const outliers = stats.values.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
      
      if (outliers.length > 0) {
        aiFocusPoints.push({
          title: `이상치 ${outliers.length}건 탐지`,
          description: `'${valueCol}' 컬럼에서 통계적 이상치가 발견되었습니다. 최대 이상치: ${Math.max(...outliers).toLocaleString()}. 데이터 오류 또는 특이 케이스일 수 있으니 검토가 필요합니다.`,
          type: 'anomaly',
          severity: 'high'
        });
      }
    }
    
    // 변동성 분석
    if (valueCol && numericStats[valueCol]) {
      const stats = numericStats[valueCol];
      const cv = stats.mean !== 0 ? (stats.std / stats.mean * 100) : 0;
      
      if (cv > 50) {
        aiFocusPoints.push({
          title: '높은 데이터 변동성',
          description: `'${valueCol}'의 변동계수가 ${cv.toFixed(1)}%로 매우 높습니다. 특정 기간/카테고리에 집중된 값이 있는지 세분화 분석을 권장합니다.`,
          type: 'volatility',
          severity: 'warning'
        });
      }
    }
    
    // 트렌드 패턴
    if (trendData.length >= 4) {
      const values = trendData.map(t => t.value);
      let upCount = 0, downCount = 0;
      for (let i = 1; i < values.length; i++) {
        if (values[i] > values[i-1]) upCount++;
        else if (values[i] < values[i-1]) downCount++;
      }
      
      if (upCount >= values.length - 2) {
        aiFocusPoints.push({
          title: '지속적 성장세',
          description: `최근 ${upCount}개 기간 연속 증가 추세입니다. 성장 동력이 유지되고 있으나, 향후 성장 둔화 가능성도 모니터링하세요.`,
          type: 'trend',
          severity: 'info'
        });
      } else if (downCount >= values.length - 2) {
        aiFocusPoints.push({
          title: '하락 추세 경고',
          description: `최근 ${downCount}개 기간 연속 감소 추세입니다. 원인 분석과 대응 전략이 필요합니다.`,
          type: 'trend',
          severity: 'warning'
        });
      }
    }
    
    // 최대/최소값 분석
    if (valueCol && numericStats[valueCol]) {
      const stats = numericStats[valueCol];
      const maxInfo = dateCol && stats.maxRow[dateCol] 
        ? `${stats.maxRow[dateCol]}에 기록` 
        : '';
      
      aiFocusPoints.push({
        title: '피크 포인트 분석',
        description: `'${valueCol}' 최대값 ${stats.max.toLocaleString()}${maxInfo ? ` (${maxInfo})` : ''}. 평균 대비 ${((stats.max / stats.mean - 1) * 100).toFixed(0)}% 높은 수준입니다.`,
        type: 'peak',
        severity: 'info'
      });
    }
    
    // 카테고리 집중도
    if (categoryCol) {
      const catGroups: Record<string, number> = {};
      file.data.forEach(row => {
        const cat = String(row[categoryCol] || 'Unknown');
        catGroups[cat] = (catGroups[cat] || 0) + 1;
      });
      const topCat = Object.entries(catGroups).sort((a, b) => b[1] - a[1])[0];
      if (topCat) {
        const topPct = (topCat[1] / file.rows * 100);
        if (topPct > 40) {
          aiFocusPoints.push({
            title: '카테고리 편중',
            description: `'${topCat[0]}' 카테고리가 전체의 ${topPct.toFixed(1)}%를 차지합니다. 다른 카테고리 성장 전략을 고려해보세요.`,
            type: 'distribution',
            severity: 'info'
          });
        }
      }
    }
    
    if (onAnalyzeComplete) {
      onAnalyzeComplete({
        insights,
        trend_data: trendData,
        kpi_metrics: kpiMetrics,
        chart_metadata: {
          time_series: dateCol ? {
            period_label: periodLabel,
            value_column: valueCol || '건수',
            date_column: dateCol,
            reason: `'${dateCol}' 기준 ${periodLabel} 시계열 분석`,
          } : null,
          distribution: categoryCol ? {
            category_column: categoryCol,
            data: (() => {
              const counts: Record<string, number> = {};
              file.data.forEach(row => {
                const val = String(row[categoryCol] || 'Unknown');
                counts[val] = (counts[val] || 0) + 1;
              });
              return Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([name, value]) => ({ name, value }));
            })(),
            reason: `'${categoryCol}' 분포`,
          } : null,
        },
        // 2차 분석 데이터
        transform_suggestions: transformSuggestions,
        future_predictions: futurePredictions,
        ai_focus_points: aiFocusPoints
      });
    }
  };

  const filteredSources = localSources.filter(source => 
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalRows = localSources.reduce((sum, f) => sum + f.rows, 0);
  const totalSize = localSources.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="h-full overflow-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".xlsx,.xls,.csv"
        multiple
        className="hidden"
        style={{ display: 'none' }}
      />

      {/* 미리보기 모달 */}
      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* 액션 모달 */}
      {showActionModal && selectedFiles.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowActionModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">다음 단계 선택</h3>
            <p className="text-gray-600 mb-6">
              {selectedFiles.length}개 파일 ({localSources.filter(f => selectedFiles.includes(f.id)).reduce((s, f) => s + f.rows, 0).toLocaleString()} rows)
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => { setShowActionModal(false); handleAnalyze(); }}
                className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl text-left transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">Analytics</h4>
                  <p className="text-sm text-gray-600">데이터 분석 및 인사이트</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
              
              <button
                onClick={() => handleNavigateToFeature('smart')}
                className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl text-left transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">Smart Transform</h4>
                  <p className="text-sm text-gray-600">자연어로 데이터 변환</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
              
              <button
                onClick={() => handleNavigateToFeature('settlement')}
                className="w-full p-4 bg-teal-50 hover:bg-teal-100 rounded-2xl text-left transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">Settlement</h4>
                  <p className="text-sm text-gray-600">정산/대사 분석</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-8 pb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Data Sources</h1>
                <p className="text-gray-600">데이터 파일을 업로드하고 관리하세요</p>
              </div>
            </div>
            <div className="flex gap-3">
              {selectedFiles.length > 0 && (
                <>
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제 ({selectedFiles.length})
                  </button>
                  <button
                    onClick={() => setShowActionModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <Sparkles className="w-6 h-6" />
                    <span className="font-semibold">다음 단계</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 통계 및 검색 */}
          {localSources.length > 0 && (
            <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span><strong className="text-gray-900">{localSources.length}</strong> 파일</span>
                <span><strong className="text-gray-900">{totalRows.toLocaleString()}</strong> rows</span>
                <span><strong className="text-gray-900">{formatFileSize(totalSize)}</strong></span>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="파일 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 업로드 영역 */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-xl shadow-purple-200/50 transition-all ${
              isDragging ? 'scale-[1.02]' : ''
            }`}
          >
            <div className={`bg-white/95 backdrop-blur rounded-3xl p-12 text-center transition-all ${
              isDragging ? 'bg-purple-50' : ''
            }`}>
              <div className={`w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200 ${
                isUploading ? 'animate-pulse' : ''
              }`}>
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isDragging ? '여기에 놓으세요!' : '파일 업로드'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Excel 또는 CSV 파일을 드래그하거나 클릭하여 업로드하세요
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-8 py-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:shadow-2xl text-white rounded-2xl shadow-xl shadow-purple-200 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  <span className="font-semibold">{isUploading ? '업로드 중...' : '파일 선택'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Sources Grid */}
          {filteredSources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">업로드된 파일 ({filteredSources.length})</h3>
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  {selectedFiles.length === filteredSources.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  전체 선택
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {filteredSources.map((source) => (
                  <div
                    key={source.id}
                    className={`group bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                      selectedFiles.includes(source.id) 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* 선택 체크박스 */}
                        <div
                          onClick={() => toggleFileSelection(source.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer ${
                            selectedFiles.includes(source.id)
                              ? 'border-purple-500 bg-white'
                              : 'border-gray-300 bg-white hover:border-purple-300'
                          }`}
                        >
                          {selectedFiles.includes(source.id) && (
                            <Check className="w-3 h-3 text-gray-900" strokeWidth={3} />
                          )}
                        </div>

                        <div 
                          onClick={() => setPreviewFile(source)}
                          className={`
                            w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer
                            ${source.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200' : ''}
                            ${source.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200' : ''}
                            ${source.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-200' : ''}
                            ${source.color === 'pink' ? 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-pink-200' : ''}
                            ${source.color === 'orange' ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-200' : ''}
                            group-hover:scale-110
                          `}
                        >
                          <FileSpreadsheet className="w-7 h-7 text-white" />
                        </div>
                        
                        <div className="flex-1" onClick={() => setPreviewFile(source)}>
                          <div className="flex items-center gap-3 mb-1 cursor-pointer">
                            <h3 className="text-lg font-bold text-gray-900 hover:text-purple-600">{source.name}</h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {source.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span>{source.rows.toLocaleString()} rows</span>
                            <span>{source.columns.length} columns</span>
                            <span>{formatFileSize(source.size)}</span>
                            <span className="text-gray-400">
                              {source.uploadedAt.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewFile(source)}
                          className="p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="미리보기"
                        >
                          <Eye className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(source.id)}
                          className="p-2 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="삭제"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    {/* 컬럼 미리보기 */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">컬럼:</div>
                      <div className="flex flex-wrap gap-2">
                        {source.columns.slice(0, 8).map((col) => (
                          <span key={col} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {col}
                          </span>
                        ))}
                        {source.columns.length > 8 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                            +{source.columns.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 빈 상태 */}
          {filteredSources.length === 0 && localSources.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Database className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">아직 업로드된 파일이 없습니다.</p>
              <p className="text-sm">위의 업로드 영역에서 파일을 추가하세요.</p>
            </div>
          )}
          
          {/* 검색 결과 없음 */}
          {filteredSources.length === 0 && localSources.length > 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
