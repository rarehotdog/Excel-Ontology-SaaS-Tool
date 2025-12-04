import { Link2, ArrowRight, Shield, GitCompare, CheckCircle, Plus, X } from 'lucide-react';
import { SettlementMode } from './types';
import { ParsedFile } from './FileUploader';

export interface KeyMappingConfig {
    // 무결성 모드: 다중 파일 매핑
    integrityMappings?: {
        sourceId: string;
        keyColumns: string[];
        valueColumn: string;
    }[];
    // 비교 모드: A-B 매핑
    comparisonMapping?: {
        primaryKeyA: string;
        primaryKeyB: string;
        valueMappings: { columnA: string; columnB: string }[];
    };
}

interface StepKeyMappingProps {
    mode: SettlementMode;
    onNext: () => void;
    uploadedFiles?: ParsedFile[];
    fileA?: ParsedFile | null;
    fileB?: ParsedFile | null;
    config: KeyMappingConfig | null;
    onConfigChange: (config: KeyMappingConfig) => void;
}

export function StepKeyMapping({ 
    mode, 
    onNext, 
    uploadedFiles = [], 
    fileA, 
    fileB,
    config,
    onConfigChange,
}: StepKeyMappingProps) {
    
    // 무결성 모드 - 다중 파일 키 매핑
    if (mode === 'integrity') {
        const hasFiles = uploadedFiles.length > 0;
        const allColumns = hasFiles 
            ? uploadedFiles.flatMap(f => f.columns.map(c => ({ file: f.name, column: c })))
            : [];
        
        // 파일별 선택된 키/값 컬럼
        const mappings = config?.integrityMappings || [];
        
        const handleAddMapping = (fileId: string) => {
            const file = uploadedFiles.find(f => f.id === fileId);
            if (!file) return;
            
            const newMapping = {
                sourceId: fileId,
                keyColumns: file.columns.length > 0 ? [file.columns[0]] : [],
                valueColumn: file.columns.find(c => c.toLowerCase().includes('금액') || c.toLowerCase().includes('amount')) || file.columns[1] || '',
            };
            
            onConfigChange({
                ...config,
                integrityMappings: [...mappings, newMapping],
            });
        };
        
        const handleUpdateMapping = (idx: number, updates: Partial<typeof mappings[0]>) => {
            const newMappings = [...mappings];
            newMappings[idx] = { ...newMappings[idx], ...updates };
            onConfigChange({
                ...config,
                integrityMappings: newMappings,
            });
        };
        
        const handleRemoveMapping = (idx: number) => {
            onConfigChange({
                ...config,
                integrityMappings: mappings.filter((_, i) => i !== idx),
            });
        };

        return (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Shield className="w-7 h-7 text-blue-600" />
                        다중 소스 키 매핑
                    </h2>
                    <p className="text-gray-600 mb-6">
                        여러 파일들을 어떤 기준으로 매칭할지 설정하세요.
                    </p>

                    {!hasFiles ? (
                        // Mock 데이터용 기본 매핑 UI
                        <div className="space-y-4">
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">1</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900">운임 Raw - 카드내역</h3>
                                    <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> AI 추천
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="p-3 bg-white rounded-xl">
                                        <div className="text-gray-500 text-xs mb-1">운임 Raw</div>
                                        <div className="font-medium text-gray-900">차량번호 + 운행시각</div>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Link2 className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="p-3 bg-white rounded-xl">
                                        <div className="text-gray-500 text-xs mb-1">카드내역</div>
                                        <div className="font-medium text-gray-900">가맹점ID + 승인시각</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    💡 실제 파일을 업로드하면 해당 파일의 컬럼으로 매핑을 설정할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    ) : (
                        // 실제 파일 컬럼 매핑 UI
                        <div className="space-y-4">
                            {/* 기존 매핑 */}
                            {mappings.map((mapping, idx) => {
                                const file = uploadedFiles.find(f => f.id === mapping.sourceId);
                                if (!file) return null;
                                
                                return (
                                    <div key={idx} className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">{idx + 1}</span>
                                                </div>
                                                <h3 className="font-bold text-gray-900">{file.name}</h3>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveMapping(idx)}
                                                className="p-1 hover:bg-red-100 rounded-lg"
                                            >
                                                <X className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-600 mb-2 block">키 컬럼 (매칭 기준)</label>
                                                <select
                                                    value={mapping.keyColumns[0] || ''}
                                                    onChange={(e) => handleUpdateMapping(idx, { keyColumns: [e.target.value] })}
                                                    className="w-full p-3 bg-white rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                >
                                                    <option value="">컬럼 선택...</option>
                                                    {file.columns.map(col => (
                                                        <option key={col} value={col}>{col}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-600 mb-2 block">값 컬럼 (비교 대상)</label>
                                                <select
                                                    value={mapping.valueColumn}
                                                    onChange={(e) => handleUpdateMapping(idx, { valueColumn: e.target.value })}
                                                    className="w-full p-3 bg-white rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                >
                                                    <option value="">컬럼 선택...</option>
                                                    {file.columns.map(col => (
                                                        <option key={col} value={col}>{col}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* 새 매핑 추가 */}
                            {uploadedFiles.filter(f => !mappings.some(m => m.sourceId === f.id)).length > 0 && (
                                <div className="p-4 border-2 border-dashed border-gray-300 rounded-2xl">
                                    <div className="text-sm text-gray-600 mb-3">파일 매핑 추가:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {uploadedFiles
                                            .filter(f => !mappings.some(m => m.sourceId === f.id))
                                            .map(file => (
                                                <button
                                                    key={file.id}
                                                    onClick={() => handleAddMapping(file.id)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-sm transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    {file.name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onNext}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg transition-all font-medium"
                    >
                        <span>다음: 검증 룰 설정</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // 비교 분석 모드 - A/B 키 매핑
    const hasFiles = fileA && fileB;
    const comparisonMapping = config?.comparisonMapping || {
        primaryKeyA: fileA?.columns[0] || '',
        primaryKeyB: fileB?.columns[0] || '',
        valueMappings: [],
    };
    
    const handleUpdateComparison = (updates: Partial<typeof comparisonMapping>) => {
        onConfigChange({
            ...config,
            comparisonMapping: { ...comparisonMapping, ...updates },
        });
    };
    
    const handleAddValueMapping = () => {
        const newMapping = { 
            columnA: fileA?.columns[1] || '', 
            columnB: fileB?.columns[1] || '' 
        };
        handleUpdateComparison({
            valueMappings: [...comparisonMapping.valueMappings, newMapping],
        });
    };
    
    const handleUpdateValueMapping = (idx: number, updates: { columnA?: string; columnB?: string }) => {
        const newMappings = [...comparisonMapping.valueMappings];
        newMappings[idx] = { ...newMappings[idx], ...updates };
        handleUpdateComparison({ valueMappings: newMappings });
    };
    
    const handleRemoveValueMapping = (idx: number) => {
        handleUpdateComparison({
            valueMappings: comparisonMapping.valueMappings.filter((_, i) => i !== idx),
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <GitCompare className="w-7 h-7 text-purple-600" />
                    비교 키 설정
                </h2>
                <p className="text-gray-600 mb-6">
                    A/B 파일을 어떤 기준으로 비교할지 설정합니다.
                </p>

                {!hasFiles ? (
                    // Mock UI
                    <div className="space-y-6">
                        <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                            <h3 className="font-bold text-gray-900 mb-4">Primary Key (매칭 기준)</h3>
                            <div className="flex gap-3">
                                {['거래ID', '가맹점ID', '정산일자'].map((key, idx) => (
                                    <button
                                        key={key}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                            idx === 0
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white text-gray-700 border border-gray-200'
                                        }`}
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                                💡 실제 파일을 업로드하면 해당 파일의 컬럼으로 매핑을 설정할 수 있습니다.
                            </p>
                        </div>
                    </div>
                ) : (
                    // 실제 매핑 UI
                    <div className="space-y-6">
                        {/* Primary Key 설정 */}
                        <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                            <h3 className="font-bold text-gray-900 mb-4">Primary Key (매칭 기준)</h3>
                            <div className="grid grid-cols-5 gap-4 items-center">
                                <div className="col-span-2">
                                    <label className="text-xs text-blue-600 mb-2 block">파일 A: {fileA?.name}</label>
                                    <select
                                        value={comparisonMapping.primaryKeyA}
                                        onChange={(e) => handleUpdateComparison({ primaryKeyA: e.target.value })}
                                        className="w-full p-3 bg-white rounded-xl border border-blue-200"
                                    >
                                        <option value="">키 컬럼 선택...</option>
                                        {fileA?.columns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-center">
                                    <Link2 className="w-6 h-6 text-purple-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-purple-600 mb-2 block">파일 B: {fileB?.name}</label>
                                    <select
                                        value={comparisonMapping.primaryKeyB}
                                        onChange={(e) => handleUpdateComparison({ primaryKeyB: e.target.value })}
                                        className="w-full p-3 bg-white rounded-xl border border-purple-200"
                                    >
                                        <option value="">키 컬럼 선택...</option>
                                        {fileB?.columns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 값 컬럼 매핑 */}
                        <div className="p-5 bg-white rounded-2xl border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">비교 컬럼 매핑</h3>
                                <button
                                    onClick={handleAddValueMapping}
                                    className="flex items-center gap-1 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    추가
                                </button>
                            </div>
                            
                            {comparisonMapping.valueMappings.length === 0 ? (
                                <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
                                    비교할 컬럼 매핑을 추가하세요
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {comparisonMapping.valueMappings.map((mapping, idx) => (
                                        <div key={idx} className="grid grid-cols-5 gap-3 items-center">
                                            <div className="col-span-2">
                                                <select
                                                    value={mapping.columnA}
                                                    onChange={(e) => handleUpdateValueMapping(idx, { columnA: e.target.value })}
                                                    className="w-full p-3 bg-blue-50 rounded-xl text-sm"
                                                >
                                                    <option value="">A 컬럼...</option>
                                                    {fileA?.columns.map(col => (
                                                        <option key={col} value={col}>{col}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex justify-center">
                                                <Link2 className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div className="col-span-2 flex gap-2">
                                                <select
                                                    value={mapping.columnB}
                                                    onChange={(e) => handleUpdateValueMapping(idx, { columnB: e.target.value })}
                                                    className="flex-1 p-3 bg-purple-50 rounded-xl text-sm"
                                                >
                                                    <option value="">B 컬럼...</option>
                                                    {fileB?.columns.map(col => (
                                                        <option key={col} value={col}>{col}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveValueMapping(idx)}
                                                    className="p-2 hover:bg-red-100 rounded-lg"
                                                >
                                                    <X className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg transition-all font-medium"
                >
                    <span>다음: 분석 옵션 설정</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
