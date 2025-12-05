import { useState, useCallback, useRef } from 'react';
import { Database, Workflow, BarChart3, Upload, Calculator, FileText, CheckCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'sources' | 'pipeline' | 'analytics' | 'exports' | 'settlement' | 'smart') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; rows: number; cols: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
        const cols = jsonData.length > 0 ? Object.keys(jsonData[0]).length : 0;
        
        setUploadedFile({
          name: file.name,
          rows: jsonData.length,
          cols,
        });
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('파일 처리 오류:', error);
      setIsProcessing(false);
    }
  };

  const getRecentItemNavigation = (type: string): 'smart' | 'settlement' | 'analytics' | 'sources' => {
    switch (type) {
      case 'Transform': return 'smart';
      case 'Settlement': return 'settlement';
      case 'Analytics': return 'analytics';
      case 'Data': return 'sources';
      default: return 'analytics';
    }
  };

  return (
    <div className="h-full overflow-auto bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        
        {/* Logo & Title */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
            <Database className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-xl text-gray-900">Excel Ontology</h2>
            <p className="text-xs text-gray-500">데이터를 지식으로, 복잡함을 단순하게</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl text-gray-900 mb-3">엑셀 데이터를 AI로 변환하세요</h1>
          <p className="text-lg text-gray-500 mb-8">자연어 명령만으로 데이터를 자동 정리하고, 복잡한 정산을 한 번에 끝내세요</p>
          
          {/* Upload Area */}
          <div className="max-w-md mx-auto mb-6" style={{ maxWidth: '768px' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
              style={{ display: 'none' }}
            />
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative border-2 rounded-2xl p-8 transition-all cursor-pointer ${
                isDragging 
                  ? 'bg-blue-50 border-blue-400' 
                  : uploadedFile 
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 border-gray-200'
              }`} 
              style={{ borderStyle: 'dashed' }}
            >
              
              <div className="flex flex-col items-center">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <h3 className="text-lg text-gray-900 mb-2">파일 처리 중...</h3>
                  </>
                ) : uploadedFile ? (
                  <>
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-900 mb-1">파일 업로드 완료!</h3>
                    <p className="text-sm text-gray-600 mb-2">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500 mb-4">
                      {uploadedFile.rows.toLocaleString()} rows × {uploadedFile.cols} columns
                    </p>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate('smart'); }}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-all"
                      >
                        Smart Transform
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate('settlement'); }}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm transition-all"
                      >
                        Settlement
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-all"
                      >
                        다른 파일
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg text-gray-900 mb-2">파일을 드래그하거나 클릭하여 업로드</h3>
                    <p className="text-sm text-gray-500 mb-4">Excel, CSV 파일을 지원합니다 (최대 50MB)</p>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate('sources'); }} 
                        className="px-6 py-3 bg-gray-900 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                        style={{ backgroundColor: '#1f2937' }}
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">파일 선택</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate('smart'); }} 
                        className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-lg transition-all text-sm"
                      >
                        템플릿으로 시작
                      </button>
                    </div>
                    
                    {/* File Format Indicators */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm">
                        <FileText className="w-3 h-3 text-emerald-700" />
                        <span className="text-xs text-gray-600">.xlsx</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-gray-600">.xls</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm">
                        <FileText className="w-3 h-3 text-pink-600" />
                        <span className="text-xs text-gray-600">.csv</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>1,234개 파일 처리됨</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>평균 처리 시간 2.3초</span>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-gray-500">템플릿</h2>
            <button className="text-xs text-gray-400 hover:text-purple-700 transition-colors">모두 보기 →</button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => onNavigate('smart')} className="group text-left p-6 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm text-gray-900 mb-1">Smart Transform</h3>
              <p className="text-xs text-gray-500">자연어로 데이터를 변환하고 레이아웃을 AI로 복제합니다</p>
            </button>

            <button onClick={() => onNavigate('settlement')} className="group text-left p-6 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm text-gray-900 mb-1">Settlement</h3>
              <p className="text-xs text-gray-500">파일을 비교하고 차이점을 자동으로 분석합니다</p>
            </button>

            <button onClick={() => onNavigate('analytics')} className="group text-left p-6 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm text-gray-900 mb-1">Analytics</h3>
              <p className="text-xs text-gray-500">팀별 분석을 통합하고 AI 인사이트를 확인합니다</p>
            </button>
          </div>
        </div>

        {/* Recents Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-gray-500">최근 작업</h2>
            <button className="text-xs text-gray-400 hover:text-purple-700 transition-colors">전체 보기 →</button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[
              { title: '월별 매출 집계', type: 'Transform', color: 'from-purple-400 to-pink-400', icon: Workflow },
              { title: '10월 운임 정산', type: 'Settlement', color: 'from-teal-400 to-teal-500', icon: Calculator },
              { title: '가맹본부별 분석', type: 'Analytics', color: 'from-orange-400 to-amber-400', icon: BarChart3 },
              { title: '운임 데이터', type: 'Data', color: 'from-blue-400 to-blue-600', icon: Database },
              { title: '정산 리포트', type: 'Analytics', color: 'from-pink-400 to-pink-500', icon: FileText },
              { title: '매출 대시보드', type: 'Analytics', color: 'from-emerald-400 to-emerald-600', icon: BarChart3 },
              { title: '11월 정산', type: 'Settlement', color: 'from-teal-400 to-teal-500', icon: Calculator },
              { title: '분기 리포트', type: 'Analytics', color: 'from-purple-400 to-purple-600', icon: FileText },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <button 
                  key={idx} 
                  onClick={() => onNavigate(getRecentItemNavigation(item.type))}
                  className="group text-left p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all"
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs text-gray-900 mb-1 truncate">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.type}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-2">
          <div 
            onClick={() => onNavigate('sources')} 
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <div className="text-xl text-gray-900 mb-1">12</div>
            <div className="text-xs text-gray-500">Data sources</div>
          </div>
          <div 
            onClick={() => onNavigate('smart')} 
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <div className="text-xl text-gray-900 mb-1">8</div>
            <div className="text-xs text-gray-500">Active transforms</div>
          </div>
          <div 
            onClick={() => onNavigate('settlement')} 
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <div className="text-xl text-gray-900 mb-1">156</div>
            <div className="text-xs text-gray-500">Settlements</div>
          </div>
          <div 
            onClick={() => onNavigate('analytics')} 
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <div className="text-xl text-gray-900 mb-1">24</div>
            <div className="text-xs text-gray-500">Reports</div>
          </div>
        </div>

      </div>
    </div>
  );
}
