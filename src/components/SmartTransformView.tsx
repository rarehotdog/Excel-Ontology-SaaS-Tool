import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Sparkles, Wand2, Upload as UploadIcon, Database, Settings, Download, FileSpreadsheet, X, Loader2, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { PipelineCanvas } from './PipelineCanvas';

// Preview Modal 컴포넌트 - body에 직접 렌더링
function PreviewModal({ 
    isOpen, 
    onClose, 
    previewData, 
    onDownload,
    title = '변환 결과 미리보기'
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    previewData: any[]; 
    onDownload: () => void;
    title?: string;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '2rem',
            }}
            onClick={onClose}
        >
            <div 
                style={{
                    backgroundColor: 'white',
                    borderRadius: '1.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    width: 'min(1000px, 90vw)',
                    maxHeight: 'min(1000px, 85vh)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ 
                    padding: '1.5rem', 
                    borderBottom: '1px solid #f3f4f6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'linear-gradient(to bottom right, #34d399, #059669)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <FileSpreadsheet style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{title}</h2>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{previewData.length}개 행</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            onClick={onDownload}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1.25rem',
                                background: 'linear-gradient(to bottom right, #10b981, #059669)',
                                color: 'white',
                                borderRadius: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <Download style={{ width: '1rem', height: '1rem' }} />
                            <span>다운로드</span>
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <X style={{ width: '1.25rem', height: '1.25rem', color: '#4b5563' }} />
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                    {previewData.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        {Object.keys(previewData[0]).map((key) => (
                                            <th key={key} style={{ 
                                                padding: '0.75rem 1rem', 
                                                textAlign: 'left', 
                                                fontSize: '0.875rem', 
                                                fontWeight: 'bold', 
                                                color: '#374151', 
                                                borderBottom: '1px solid #e5e7eb',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, idx) => (
                                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                                            {Object.values(row).map((val, i) => (
                                                <td key={i} style={{ 
                                                    padding: '0.75rem 1rem', 
                                                    fontSize: '0.875rem', 
                                                    color: '#4b5563', 
                                                    borderBottom: '1px solid #f3f4f6',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {val === null || val === undefined ? '-' : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
                            데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

interface PipelineNode {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    data?: { icon: string };
}

interface PipelineConnection {
    from: string;
    to: string;
}

interface PreviewData {
    [key: string]: any;
}

// 노드 타입에 따른 프롬프트 생성
const nodeTypeToPrompt: Record<string, string> = {
    'Filter Rows': '조건에 맞는 데이터만 필터링해줘',
    'Group By': '그룹별로 데이터를 집계해줘',
    'Join Data': '데이터를 결합해줘',
    'Calculate': '새로운 계산 컬럼을 추가해줘',
};

export function SmartTransformView() {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string>(''); // 서버에 저장된 파일명
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pipelineData, setPipelineData] = useState<{ nodes: PipelineNode[], connections: PipelineConnection[] } | null>(null);
    const [previewData, setPreviewData] = useState<PreviewData[]>([]);
    const [transformedFileName, setTransformedFileName] = useState<string>(''); // 변환된 결과 파일명
    const [showPreview, setShowPreview] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [appliedOperations, setAppliedOperations] = useState<string[]>([]); // 적용된 작업 목록
    const [suggestedTemplates, setSuggestedTemplates] = useState<{id: string; label: string; prompt: string; description: string}[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [showReferenceModal, setShowReferenceModal] = useState(false);
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    const [isUploadingReference, setIsUploadingReference] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const referenceFileInputRef = useRef<HTMLInputElement>(null);

    // 템플릿 추천 API 호출
    const fetchSuggestedTemplates = async (filename: string) => {
        setIsLoadingTemplates(true);
        try {
            const response = await fetch('http://localhost:8000/smart-transform/suggest-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setSuggestedTemplates(data.templates || []);
            }
        } catch (error) {
            console.error('Template suggestion error:', error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadSuccess(false);

        try {
            const formData = new FormData();
            formData.append('files', file);

            const response = await fetch('http://localhost:8000/data/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setUploadedFile(file);
                // 서버에서 반환하는 파일명 저장 (응답: {uploaded: [{filename: ...}]})
                const serverFilename = data.uploaded?.[0]?.filename || file.name;
                console.log('업로드된 파일명:', serverFilename);
                setUploadedFileName(serverFilename);
                setUploadSuccess(true);
                // 파이프라인 및 미리보기 초기화
                setPipelineData(null);
                setPreviewData([]);
                setTransformedFileName('');
                setAppliedOperations([]);
                setTimeout(() => setUploadSuccess(false), 3000);
                
                // 템플릿 추천 API 호출
                fetchSuggestedTemplates(serverFilename);
            } else {
                alert('파일 업로드 실패');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('서버 연결 오류');
        } finally {
            setIsUploading(false);
        }
    };

    // 자연어 또는 노드 기반으로 실제 데이터 변환 실행
    const executeTransform = async (prompt: string) => {
        if (!prompt.trim()) return;
        if (!uploadedFileName) {
            alert('먼저 파일을 업로드해주세요.');
            return;
        }

        setIsGenerating(true);
        console.log('변환 실행:', { prompt, filename: uploadedFileName });

        try {
            // 실제 데이터 변환 실행
            const response = await fetch('http://localhost:8000/smart-transform/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: prompt,
                    filename: uploadedFileName 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('변환 결과:', data);
                
                // 파이프라인 시각화를 위한 노드 생성
                const generateResponse = await fetch('http://localhost:8000/smart-transform/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: prompt }),
                });
                
                if (generateResponse.ok) {
                    const generateData = await generateResponse.json();
                    setPipelineData({
                        nodes: generateData.nodes,
                        connections: generateData.connections,
                    });
                }

                // execute API의 실제 변환 결과 사용
                const transformedData = data.previewData || [];
                console.log('변환된 데이터 행 수:', transformedData.length);
                setPreviewData(transformedData);
                setTransformedFileName(data.outputFilename || '');
                // 적용된 변환은 현재 실행된 것만 표시 (덮어쓰기)
                setAppliedOperations([prompt]);
            } else {
                const errorData = await response.json();
                console.error('변환 실패:', errorData);
                alert(`변환 실패: ${errorData.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Transform error:', error);
            alert('서버 연결 오류');
        } finally {
            setIsGenerating(false);
        }
    };

    // 자동 생성 버튼 클릭
    const handleSmartBuild = async () => {
        await executeTransform(naturalLanguageInput);
    };

    // CSV 다운로드
    const handleDownloadCSV = () => {
        if (previewData.length === 0) return;

        try {
            const headers = Object.keys(previewData[0]);
            const csvContent = [
                headers.join(','),
                ...previewData.map(row => headers.map(h => {
                    const val = row[h];
                    // 쉼표나 따옴표가 포함된 경우 처리
                    if (val === null || val === undefined) return '';
                    const strVal = String(val);
                    if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
                        return `"${strVal.replace(/"/g, '""')}"`;
                    }
                    return strVal;
                }).join(','))
            ].join('\n');

            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM 추가
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transformed_${Date.now()}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('CSV Download error:', error);
        }
    };

    // 노드 드래그 시작
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    // Auto Insight 실행
    const executeAutoInsight = async () => {
        if (!uploadedFileName) {
            alert('먼저 파일을 업로드해주세요.');
            return;
        }

        setIsGenerating(true);
        console.log('Auto Insight 실행:', uploadedFileName);

        try {
            const response = await fetch('http://localhost:8000/smart-transform/auto-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: uploadedFileName }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Auto Insight 결과:', data);
                
                // 파이프라인 시각화
                setPipelineData({
                    nodes: [
                        { id: 'source-1', type: 'source', label: 'Data Source', x: 100, y: 180, data: { icon: 'Database' } },
                        { id: 'insight-1', type: 'transform', label: 'Auto Insight', x: 320, y: 180, data: { icon: 'Lightbulb' } },
                        { id: 'export-1', type: 'output', label: 'Export Result', x: 540, y: 180, data: { icon: 'Download' } },
                    ],
                    connections: [
                        { from: 'source-1', to: 'insight-1' },
                        { from: 'insight-1', to: 'export-1' },
                    ],
                });

                setPreviewData(data.previewData || []);
                setTransformedFileName(data.outputFilename || '');
                setAppliedOperations(['Auto Insight 분석']);
                
                // 인사이트 알림
                if (data.insights && data.insights.length > 0) {
                    console.log('발견된 인사이트:', data.insights);
                }
            } else {
                const errorData = await response.json();
                alert(`분석 실패: ${errorData.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Auto Insight error:', error);
            alert('서버 연결 오류');
        } finally {
            setIsGenerating(false);
        }
    };

    // Smart Format - 레퍼런스 파일 모달 열기
    const openSmartFormatModal = () => {
        if (!uploadedFileName) {
            alert('먼저 변환할 파일을 업로드해주세요.');
            return;
        }
        setShowReferenceModal(true);
    };

    // 레퍼런스 파일 업로드 및 Smart Format 실행
    const handleReferenceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setReferenceFile(file);
        setIsUploadingReference(true);

        try {
            // 1. 레퍼런스 파일 업로드
            const formData = new FormData();
            formData.append('files', file);

            const uploadResponse = await fetch('http://localhost:8000/data/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                alert('레퍼런스 파일 업로드 실패');
                return;
            }

            const uploadData = await uploadResponse.json();
            const referenceFilename = uploadData.uploaded?.[0]?.filename || file.name;

            // 2. Smart Format 실행 (레퍼런스 기반)
            setIsGenerating(true);
            setShowReferenceModal(false);

            const response = await fetch('http://localhost:8000/smart-transform/smart-format', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    filename: uploadedFileName,
                    reference_filename: referenceFilename 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Smart Format 결과:', data);
                
                // 파이프라인 시각화
                setPipelineData({
                    nodes: [
                        { id: 'source-1', type: 'source', label: 'Data Source', x: 100, y: 180, data: { icon: 'Database' } },
                        { id: 'ref-1', type: 'source', label: 'Reference', x: 100, y: 300, data: { icon: 'FileSpreadsheet' } },
                        { id: 'format-1', type: 'transform', label: 'Smart Format', x: 320, y: 240, data: { icon: 'Paintbrush' } },
                        { id: 'export-1', type: 'output', label: 'Export Result', x: 540, y: 240, data: { icon: 'Download' } },
                    ],
                    connections: [
                        { from: 'source-1', to: 'format-1' },
                        { from: 'ref-1', to: 'format-1' },
                        { from: 'format-1', to: 'export-1' },
                    ],
                });

                setPreviewData(data.previewData || []);
                setTransformedFileName(data.outputFilename || '');
                setAppliedOperations([`레퍼런스 기반 변환 (${file.name})`]);
                
                if (data.mappingInfo) {
                    console.log('컬럼 매핑:', data.mappingInfo);
                }
            } else {
                const errorData = await response.json();
                // 관련 없는 파일 경고
                alert(`⚠️ Smart Format 실패\n\n${errorData.detail || '알 수 없는 오류'}`);
                // 실패 시 적용된 변환에 추가하지 않음 - 레퍼런스 파일만 데이터 스토어에서 제거 요청 가능
                setReferenceFile(null);
            }
        } catch (error) {
            console.error('Smart Format error:', error);
            alert('서버 연결 오류');
        } finally {
            setIsUploadingReference(false);
            setIsGenerating(false);
            // 파일 입력 초기화
            if (referenceFileInputRef.current) {
                referenceFileInputRef.current.value = '';
            }
        }
    };

    // 캔버스에 노드 드롭 시 해당 작업 적용
    const handleNodeDrop = async (nodeLabel: string) => {
        // AI Powered 노드 처리
        if (nodeLabel === 'Auto Insight') {
            await executeAutoInsight();
            return;
        }
        
        if (nodeLabel === 'Smart Format') {
            openSmartFormatModal();
            return;
        }

        // 일반 Transform 노드 처리
        const prompt = nodeTypeToPrompt[nodeLabel];
        if (prompt) {
            // 자연어 입력란에 프롬프트 설정 (덮어쓰기 - 중복 방지)
            setNaturalLanguageInput(prompt);
            
            // 파일이 업로드된 경우 자동 실행
            if (uploadedFileName) {
                await executeTransform(prompt);
            }
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="p-6 pb-0">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-purple-100/50 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Smart Transform</h1>
                                <p className="text-sm text-gray-600">AI 기반 데이터 변환 파이프라인</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* 파일 업로드 - 완전히 숨김 */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                style={{ display: 'none' }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-dashed border-gray-300"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : uploadedFile ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <UploadIcon className="w-5 h-5" />
                                )}
                                <span className="text-sm">{uploadedFile ? uploadedFile.name : '파일 업로드'}</span>
                            </button>
                        </div>
                    </div>

                    {/* 파일 미업로드 경고 */}
                    {!uploadedFile && (
                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <p className="text-sm text-amber-700">데이터 변환을 위해 먼저 파일을 업로드해주세요.</p>
                        </div>
                    )}

                    {/* Smart Builder Panel */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Wand2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Smart Filter</h3>
                                <p className="text-xs text-gray-600">자연어로 데이터를 변환하세요</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <textarea
                                value={naturalLanguageInput}
                                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                                placeholder="예: '금액 상위 10개만 보여줘', '부서별로 그룹화하고 합계를 계산해줘', '서울 지역만 필터링해줘'"
                                className="flex-1 h-24 px-4 py-3 bg-white border-2 border-purple-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none transition-all"
                            />
                            <div className="flex flex-col gap-2 w-48">
                                <button
                                    onClick={handleSmartBuild}
                                    disabled={!naturalLanguageInput.trim() || isGenerating || !uploadedFile}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:scale-100 disabled:cursor-not-allowed text-sm font-bold"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    <span>{isGenerating ? '변환 중...' : '데이터 변환'}</span>
                                </button>
                                {previewData.length > 0 && (
                                    <button
                                        onClick={() => setShowPreview(true)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-sm font-medium cursor-pointer relative z-10"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>결과 보기</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Templates - 파일 업로드 후에만 표시 */}
                        {uploadedFile && (
                            <div className="mt-4">
                                {isLoadingTemplates ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>추천 템플릿 분석 중...</span>
                                    </div>
                                ) : suggestedTemplates.length > 0 ? (
                                    <div className="flex gap-3 flex-wrap">
                                        {suggestedTemplates.map((template, idx) => (
                                            <button
                                                key={template.id}
                                                onClick={() => setNaturalLanguageInput(template.prompt)}
                                                className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-left transition-all hover:scale-102 flex items-center gap-2"
                                            >
                                                <span className="text-xs font-bold text-purple-600">추천 {idx + 1}</span>
                                                <span className="text-xs text-gray-700">{template.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">파일 분석 후 추천 템플릿이 표시됩니다.</p>
                                )}
                            </div>
                        )}

                        {/* 적용된 작업 목록 */}
                        {appliedOperations.length > 0 && (
                            <div className="mt-4 p-3 bg-white/50 rounded-xl">
                                <p className="text-xs font-bold text-gray-500 mb-2">적용된 변환:</p>
                                <div className="flex flex-wrap gap-2">
                                    {appliedOperations.map((op, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg">
                                            {op.length > 30 ? op.slice(0, 30) + '...' : op}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden gap-6 px-6 pb-6">
                {/* Sidebar - Node Library */}
                <div className="w-72 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-auto flex flex-col">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                                <Plus className="w-4 h-4 text-white" />
                            </div>
                            Node Library
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">노드를 캔버스로 드래그하여 작업을 추가하세요</p>

                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Input</div>
                                <div
                                    draggable
                                    onDragStart={(e) => onDragStart(e, 'input', 'Data Source')}
                                    className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
                                        <UploadIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 mb-1">Data Source</div>
                                    <div className="text-xs text-gray-600">Excel/CSV input</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Transform</div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Filter Rows', desc: '조건별 필터링', icon: '🔍', type: 'default' },
                                        { name: 'Group By', desc: '그룹화 및 집계', icon: '📊', type: 'default' },
                                        { name: 'Join Data', desc: '데이터 결합', icon: '🔗', type: 'default' },
                                        { name: 'Calculate', desc: '계산 및 수식', icon: '🧮', type: 'default' },
                                    ].map((node) => (
                                        <div
                                            key={node.name}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, node.type, node.name)}
                                            onDoubleClick={() => handleNodeDrop(node.name)}
                                            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300"
                                            title="더블클릭하여 즉시 적용"
                                        >
                                            <div className="text-lg mb-2">{node.icon}</div>
                                            <div className="text-sm font-bold text-gray-900 mb-1">{node.name}</div>
                                            <div className="text-xs text-gray-600">{node.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">AI Powered</div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Smart Format', desc: '레퍼런스 파일 기반 변환', icon: '🎨', type: 'default' },
                                        { name: 'Auto Insight', desc: '자동 분석', icon: '💡', type: 'default' },
                                    ].map((node) => (
                                        <div
                                            key={node.name}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, node.type, node.name)}
                                            onDoubleClick={() => handleNodeDrop(node.name)}
                                            className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300 border-2 border-purple-200"
                                            title="더블클릭하여 즉시 적용"
                                        >
                                            <div className="text-lg mb-2">{node.icon}</div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-purple-600" />
                                                <div className="text-sm font-bold text-gray-900">{node.name}</div>
                                            </div>
                                            <div className="text-xs text-gray-600">{node.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-hidden">
                    <PipelineCanvas
                        selectedNode={selectedNode}
                        onSelectNode={setSelectedNode}
                        pipelineData={pipelineData}
                        onNodeDrop={handleNodeDrop}
                    />
                </div>

                {/* Properties Panel */}
                <div className="w-80 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-auto">
                    <div className="p-6">
                        {selectedNode ? (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                        <Settings className="w-4 h-4 text-white" />
                                    </div>
                                    Node Properties
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Node Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
                                            placeholder="Enter name..."
                                            defaultValue={selectedNode}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white resize-none transition-all"
                                            rows={4}
                                            placeholder="Enter description..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-500 mb-2">Select a node to view properties</p>
                                <p className="text-xs text-gray-400">노드를 클릭하여 설정을 변경하세요</p>
                            </div>
                        )}

                        {/* 변환 결과 요약 */}
                        {previewData.length > 0 && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
                                <h4 className="text-sm font-bold text-emerald-800 mb-2">변환 결과</h4>
                                <p className="text-xs text-emerald-700">
                                    {previewData.length}개의 행이 생성되었습니다.
                                </p>
                                {transformedFileName && (
                                    <p className="text-xs text-emerald-600 mt-1">
                                        파일: {transformedFileName}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                previewData={previewData}
                onDownload={handleDownloadCSV}
                title="변환 결과 미리보기"
            />

            {/* Reference File Upload Modal for Smart Format */}
            {showReferenceModal && createPortal(
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999,
                        padding: '2rem',
                    }}
                    onClick={() => setShowReferenceModal(false)}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '1.5rem',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            width: 'min(500px, 90vw)',
                            padding: '2rem',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🎨</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Smart Format</h2>
                                <p className="text-sm text-gray-600">레퍼런스 파일 기반 변환</p>
                            </div>
                        </div>

                        <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                            <p className="text-sm text-purple-800 mb-2">
                                <strong>변환할 파일:</strong> {uploadedFile?.name}
                            </p>
                            <p className="text-xs text-purple-600">
                                아래에서 레퍼런스 파일을 선택하면, 해당 파일의 구조와 형식에 맞게 데이터가 변환됩니다.
                            </p>
                        </div>

                        <input
                            type="file"
                            ref={referenceFileInputRef}
                            onChange={handleReferenceFileUpload}
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                        />

                        <button
                            onClick={() => referenceFileInputRef.current?.click()}
                            disabled={isUploadingReference}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {isUploadingReference ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>변환 중...</span>
                                </>
                            ) : (
                                <>
                                    <UploadIcon className="w-5 h-5" />
                                    <span>레퍼런스 파일 선택</span>
                                </>
                            )}
                        </button>

                        <p className="mt-4 text-xs text-center text-gray-500">
                            지원 형식: .xlsx, .xls, .csv
                        </p>

                        <button
                            onClick={() => setShowReferenceModal(false)}
                            className="mt-4 w-full py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                        >
                            취소
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
