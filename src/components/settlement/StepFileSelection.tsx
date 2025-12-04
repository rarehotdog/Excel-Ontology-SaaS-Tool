import { FileSpreadsheet, CheckCircle, ArrowRight, Upload, Shield, GitCompare } from 'lucide-react';
import { SettlementMode, IntegritySource } from './types';
import { FileUploader, ParsedFile } from './FileUploader';

interface StepFileSelectionProps {
    mode: SettlementMode;
    integritySources: IntegritySource[];
    selectedSources: string[];
    onToggleSource: (id: string) => void;
    onNext: () => void;
    // 실제 파일 업로드 props
    uploadedFiles: ParsedFile[];
    onFilesUploaded: (files: ParsedFile[]) => void;
    fileA: ParsedFile | null;
    fileB: ParsedFile | null;
    onFileASelected: (file: ParsedFile | null) => void;
    onFileBSelected: (file: ParsedFile | null) => void;
}

export function StepFileSelection({ 
    mode, 
    integritySources, 
    selectedSources, 
    onToggleSource, 
    onNext,
    uploadedFiles,
    onFilesUploaded,
    fileA,
    fileB,
    onFileASelected,
    onFileBSelected,
}: StepFileSelectionProps) {

    if (mode === 'integrity') {
        return (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Shield className="w-7 h-7 text-blue-600" />
                        다중 소스 데이터 선택
                    </h2>
                    <p className="text-gray-600 mb-6">
                        대사할 데이터 소스들을 선택하세요. 여러 파일을 동시에 처리하여 이상 패턴을 탐지합니다.
                    </p>
                    
                    {/* 파일 업로드 영역 */}
                    <div className="mb-6">
                        <FileUploader
                            onFilesParsed={onFilesUploaded}
                            multiple={true}
                            label="파일을 드래그하거나 클릭하여 업로드"
                            description="Excel, CSV 파일 지원 • 여러 파일 동시 업로드 가능"
                        />
                    </div>

                    {/* Mock 데이터 소스 (업로드 없이도 테스트 가능) */}
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 mb-6">
                        <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-blue-800">
                                <strong>Demo 모드:</strong> 파일 없이도 Mock 데이터로 테스트할 수 있습니다. 아래에서 소스를 선택하세요.
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {integritySources.map((source) => (
                            <div
                                key={source.id}
                                onClick={() => onToggleSource(source.id)}
                                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                                    source.selected
                                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className={`w-6 h-6 ${source.selected ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <div>
                                            <div className="text-lg font-bold text-gray-900">{source.name}</div>
                                            <div className="text-sm text-gray-600">{source.file}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {source.required && (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">필수</span>
                                        )}
                                        {source.id.startsWith('file-') && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">업로드됨</span>
                                        )}
                                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                                            {source.sheets} sheet(s)
                                        </span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                            source.selected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                                        }`}>
                                            {source.selected && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </div>
                                {source.selected && (
                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                        <div className="text-xs font-medium text-gray-600 mb-2">Preview Schema</div>
                                        <div className="flex flex-wrap gap-2">
                                            {source.id === 'fare' && ['지역본부', '가맹점명', '차량번호', '기사명', '운행시각', '운임금액'].map(col => (
                                                <span key={col} className="px-2 py-1 bg-white text-gray-700 rounded-lg text-xs border border-gray-100">{col}</span>
                                            ))}
                                            {source.id === 'card' && ['승인번호', '승인시각', '금액', '카드번호', '가맹점ID'].map(col => (
                                                <span key={col} className="px-2 py-1 bg-white text-gray-700 rounded-lg text-xs border border-gray-100">{col}</span>
                                            ))}
                                            {source.id === 'billing' && ['가맹점ID', '이용료금액', '포인트사용금액', '정산일자'].map(col => (
                                                <span key={col} className="px-2 py-1 bg-white text-gray-700 rounded-lg text-xs border border-gray-100">{col}</span>
                                            ))}
                                            {source.id === 'driver' && ['기사ID', '기사명', '차량번호', '소속', '등록일자'].map(col => (
                                                <span key={col} className="px-2 py-1 bg-white text-gray-700 rounded-lg text-xs border border-gray-100">{col}</span>
                                            ))}
                                            {source.id.startsWith('file-') && (
                                                <span className="text-xs text-gray-500">실제 파일 컬럼이 표시됩니다</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 선택 상태 요약 */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                선택된 소스: <strong className="text-gray-900">{selectedSources.length}개</strong>
                                {uploadedFiles.length > 0 && (
                                    <span className="ml-2 text-green-600">(업로드 {uploadedFiles.length}개 포함)</span>
                                )}
                            </span>
                            <span className="text-sm text-gray-600">
                                필수 항목: <strong className={integritySources.filter(s => s.required && s.selected).length >= 2 ? 'text-green-600' : 'text-red-600'}>
                                    {integritySources.filter(s => s.required && s.selected).length}/2
                                </strong>
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onNext}
                        disabled={selectedSources.length < 1}
                        className={`w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl shadow-lg transition-all font-medium ${
                            selectedSources.length >= 1
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <span>다음 단계: 키 매핑</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // 비교 분석 모드 - A/B 파일 선택
    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <GitCompare className="w-7 h-7 text-purple-600" />
                    A/B 비교 파일 선택
                </h2>
                <p className="text-gray-600 mb-6">
                    비교할 두 파일을 업로드하세요. 동일한 키 기준으로 차이점과 누락 항목을 분석합니다.
                </p>

                <div className="grid grid-cols-2 gap-6">
                    {/* 파일 A */}
                    <div className={`p-6 rounded-2xl border-2 transition-all ${
                        fileA ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-bold">A</div>
                            <h3 className="text-lg font-bold text-gray-900">기준 파일 (Target)</h3>
                        </div>
                        
                        <FileUploader
                            onFilesParsed={(files) => onFileASelected(files[0] || null)}
                            multiple={false}
                            label="파일 A 업로드"
                            description="기준이 되는 파일을 선택하세요"
                        />

                        {fileA && (
                            <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-gray-900">{fileA.name}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {fileA.rowCount.toLocaleString()} rows × {fileA.columns.length} columns
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {fileA.columns.slice(0, 5).map(col => (
                                        <span key={col} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                            {col}
                                        </span>
                                    ))}
                                    {fileA.columns.length > 5 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                                            +{fileA.columns.length - 5}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 파일 B */}
                    <div className={`p-6 rounded-2xl border-2 transition-all ${
                        fileB ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-bold">B</div>
                            <h3 className="text-lg font-bold text-gray-900">비교 파일 (Reference)</h3>
                        </div>
                        
                        <FileUploader
                            onFilesParsed={(files) => onFileBSelected(files[0] || null)}
                            multiple={false}
                            label="파일 B 업로드"
                            description="비교할 파일을 선택하세요"
                        />

                        {fileB && (
                            <div className="mt-4 p-4 bg-white rounded-xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium text-gray-900">{fileB.name}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {fileB.rowCount.toLocaleString()} rows × {fileB.columns.length} columns
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {fileB.columns.slice(0, 5).map(col => (
                                        <span key={col} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                            {col}
                                        </span>
                                    ))}
                                    {fileB.columns.length > 5 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                                            +{fileB.columns.length - 5}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 선택 상태 요약 */}
                <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            <strong className="text-blue-600">A:</strong> {fileA?.name || '선택 안됨'}
                            {fileA && <span className="text-gray-500 ml-1">({fileA.rowCount.toLocaleString()} rows)</span>}
                        </div>
                        <GitCompare className="w-5 h-5 text-purple-500" />
                        <div className="text-sm text-gray-700">
                            <strong className="text-purple-600">B:</strong> {fileB?.name || '선택 안됨'}
                            {fileB && <span className="text-gray-500 ml-1">({fileB.rowCount.toLocaleString()} rows)</span>}
                        </div>
                    </div>
                </div>

                {/* Demo 모드 안내 */}
                {!fileA && !fileB && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                        <div className="text-sm text-yellow-800">
                            💡 <strong>Tip:</strong> 파일을 업로드하지 않아도 Mock 데이터로 기능을 테스트할 수 있습니다.
                        </div>
                    </div>
                )}

                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-lg transition-all font-medium hover:shadow-xl"
                >
                    <span>다음: 비교 키 설정</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
