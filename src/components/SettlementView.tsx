import { useState, useMemo } from 'react';
import { Calculator, FileSpreadsheet, Sparkles, Shield, GitCompare, CheckCircle, ArrowRight } from 'lucide-react';
import { SettlementMode, StepType, STEPS, ComparisonResult, IntegrityResult } from './settlement/types';
import { SettlementSidebar } from './settlement/SettlementSidebar';
import { StepFileSelection } from './settlement/StepFileSelection';
import { StepKeyMapping } from './settlement/StepKeyMapping';
import { StepRuleSettings } from './settlement/StepRuleSettings';
import { StepExecution } from './settlement/StepExecution';
import { StepDrillDown } from './settlement/StepDrillDown';
import { StepReport } from './settlement/StepReport';
import { ParsedFile } from './settlement/FileUploader';

export function SettlementView() {
    const [mode, setMode] = useState<SettlementMode>('integrity');
    const [currentStep, setCurrentStep] = useState<StepType>(1);
    const [selectedSources, setSelectedSources] = useState<string[]>([]);
    
    // 파일 업로드 상태
    const [uploadedFiles, setUploadedFiles] = useState<ParsedFile[]>([]);
    const [fileA, setFileA] = useState<ParsedFile | null>(null);
    const [fileB, setFileB] = useState<ParsedFile | null>(null);

    // 무결성 검증 모드용 데이터 소스 (Mock + 실제 업로드 파일 통합)
    const integritySources = useMemo(() => {
        const mockSources = [
            { id: 'fare', name: '운임 Raw', file: '2024_10_운임raw.xlsx', sheets: 7, required: true, selected: selectedSources.includes('fare') },
            { id: 'card', name: '카드내역', file: '2024_10_카드내역.xlsx', sheets: 1, required: true, selected: selectedSources.includes('card') },
            { id: 'billing', name: '빌링데이터', file: '2024_10_빌링데이터.xlsx', sheets: 1, required: false, selected: selectedSources.includes('billing') },
            { id: 'driver', name: '기사정보', file: '2024_10_기사정보.xlsx', sheets: 1, required: false, selected: selectedSources.includes('driver') },
        ];
        
        // 업로드된 파일들도 소스로 추가
        const uploadedSources = uploadedFiles.map(file => ({
            id: file.id,
            name: file.name.replace(/\.[^/.]+$/, ''),
            file: file.name,
            sheets: file.sheets.length,
            required: false,
            selected: selectedSources.includes(file.id),
        }));
        
        return [...mockSources, ...uploadedSources];
    }, [selectedSources, uploadedFiles]);

    // 무결성 검증 결과 (Mock - 실제 데이터가 있으면 계산)
    const integrityResult: IntegrityResult = useMemo(() => {
        if (uploadedFiles.length > 0) {
            const totalRows = uploadedFiles.reduce((sum, f) => sum + f.rowCount, 0);
            return {
                total: totalRows,
                issues: Math.floor(totalRows * 0.01),
                issueRate: 1.0,
                byType: [
                    { type: '금액 불일치', count: Math.floor(totalRows * 0.005), rate: 50 },
                    { type: '중복 데이터', count: Math.floor(totalRows * 0.003), rate: 30 },
                    { type: '누락 데이터', count: Math.floor(totalRows * 0.002), rate: 20 },
                ]
            };
        }
        return {
            total: 12345,
            issues: 123,
            issueRate: 1.0,
            byType: [
                { type: '카드 금액 불일치', count: 80, rate: 65 },
                { type: '중복 운임', count: 30, rate: 24 },
                { type: '비정상 운행', count: 13, rate: 11 },
            ]
        };
    }, [uploadedFiles]);

    // 비교 분석 결과 (Mock - 실제 데이터가 있으면 계산)
    const comparisonResult: ComparisonResult = useMemo(() => {
        if (fileA && fileB) {
            const totalItems = Math.max(fileA.rowCount, fileB.rowCount);
            return {
                totalItems,
                withDiff: Math.floor(totalItems * 0.08),
                diffRate: 8.0,
                totalDiff: Math.floor(totalItems * 1000),
                topDiffs: [
                    { item: '항목 A', a: 125000000, b: 132500000, diff: 7500000, rate: 6.0 },
                    { item: '항목 B', a: 98000000, b: 95000000, diff: -3000000, rate: -3.1 },
                    { item: '항목 C', a: 156000000, b: 158000000, diff: 2000000, rate: 1.3 },
                ]
            };
        }
        return {
            totalItems: 300,
            withDiff: 25,
            diffRate: 8.3,
            totalDiff: 12500000,
            topDiffs: [
                { item: '항목 A', a: 125000000, b: 132500000, diff: 7500000, rate: 6.0 },
                { item: '항목 B', a: 98000000, b: 95000000, diff: -3000000, rate: -3.1 },
                { item: '항목 C', a: 156000000, b: 158000000, diff: 2000000, rate: 1.3 },
            ]
        };
    }, [fileA, fileB]);

    const handleNext = () => {
        if (currentStep < 6) {
            setCurrentStep((prev) => (prev + 1) as StepType);
        }
    };

    const handleToggleSource = (id: string) => {
        setSelectedSources(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleModeChange = (newMode: SettlementMode) => {
        setMode(newMode);
        setCurrentStep(1);
        // 모드 변경 시 파일 상태 리셋
        setUploadedFiles([]);
        setFileA(null);
        setFileB(null);
        setSelectedSources([]);
    };

    const handleFilesUploaded = (files: ParsedFile[]) => {
        setUploadedFiles(files);
        // 새로 업로드된 파일들을 자동 선택
        const newIds = files.map(f => f.id);
        setSelectedSources(prev => [...prev.filter(id => !id.startsWith('file-')), ...newIds]);
    };

    const handleFileASelected = (file: ParsedFile | null) => {
        setFileA(file);
    };

    const handleFileBSelected = (file: ParsedFile | null) => {
        setFileB(file);
    };

    // 실제 데이터 가져오기 (StepExecution에 전달)
    const getActualData = () => {
        if (mode === 'integrity') {
            return uploadedFiles.flatMap(f => f.data);
        } else {
            return {
                fileAData: fileA?.data || [],
                fileBData: fileB?.data || [],
            };
        }
    };

    return (
        <div className="h-full overflow-auto bg-gray-50">
            {/* Header */}
            <div className="p-8 pb-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
                                <Calculator className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">Settlement Assistant</h1>
                                <p className="text-gray-600">정산/대사 워크플로우를 한 화면에서 처리하세요</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-3 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all hover:scale-105 font-medium">
                                <FileSpreadsheet className="w-5 h-5" />
                                <span>템플릿 불러오기</span>
                            </button>
                            <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white rounded-2xl shadow-lg shadow-teal-200 hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium">
                                <Sparkles className="w-6 h-6" />
                                <span>Auto Inference</span>
                            </button>
                        </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleModeChange('integrity')}
                            className={`flex-1 p-6 rounded-2xl transition-all ${mode === 'integrity'
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <Shield className="w-6 h-6" />
                                <span className="text-xl font-bold">무결성 검증 모드</span>
                            </div>
                            <p className={`text-sm ${mode === 'integrity' ? 'text-white/80' : 'text-gray-600'}`}>
                                다중 소스 데이터 대사 및 이상 탐지
                            </p>
                        </button>
                        <button
                            onClick={() => handleModeChange('comparison')}
                            className={`flex-1 p-6 rounded-2xl transition-all ${mode === 'comparison'
                                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <GitCompare className="w-6 h-6" />
                                <span className="text-xl font-bold">비교 분석 모드</span>
                            </div>
                            <p className={`text-sm ${mode === 'comparison' ? 'text-white/80' : 'text-gray-600'}`}>
                                A/B 파일 비교 및 차이 분석
                            </p>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8">
                <div className="flex gap-6">
                    {/* Left: Step Navigation */}
                    <div className="w-80 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-purple-100/50">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">워크플로우 단계</h3>
                        <div className="space-y-3">
                            {STEPS.map((step, idx) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <div key={step.id}>
                                        <button
                                            onClick={() => setCurrentStep(step.id as StepType)}
                                            className={`w-full p-4 rounded-2xl transition-all text-left ${isActive
                                                ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg scale-105'
                                                : isCompleted
                                                    ? 'bg-gradient-to-br from-green-50 to-green-100 text-gray-700'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive
                                                    ? 'bg-white/20'
                                                    : isCompleted
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-200'
                                                }`}>
                                                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium mb-1">Step {step.id}</div>
                                                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                                                        {step.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        {idx < STEPS.length - 1 && (
                                            <div className="flex justify-center py-2">
                                                <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Center: Main Work Area */}
                    <div className="flex-1">
                        {currentStep === 1 && (
                            <StepFileSelection
                                mode={mode}
                                integritySources={integritySources}
                                selectedSources={selectedSources}
                                onToggleSource={handleToggleSource}
                                onNext={handleNext}
                                // 실제 파일 업로드
                                uploadedFiles={uploadedFiles}
                                onFilesUploaded={handleFilesUploaded}
                                fileA={fileA}
                                fileB={fileB}
                                onFileASelected={handleFileASelected}
                                onFileBSelected={handleFileBSelected}
                            />
                        )}
                        {currentStep === 2 && <StepKeyMapping mode={mode} onNext={handleNext} />}
                        {currentStep === 3 && <StepRuleSettings mode={mode} onNext={handleNext} />}
                        {currentStep === 4 && (
                            <StepExecution
                                mode={mode}
                                integrityResult={integrityResult}
                                comparisonResult={comparisonResult}
                                onNext={handleNext}
                                // 실제 데이터 전달
                                uploadedFiles={uploadedFiles}
                                fileA={fileA}
                                fileB={fileB}
                            />
                        )}
                        {currentStep === 5 && <StepDrillDown mode={mode} onNext={handleNext} />}
                        {currentStep === 6 && <StepReport mode={mode} />}
                    </div>

                    {/* Right: AI Suggestions */}
                    <SettlementSidebar
                        mode={mode}
                        currentStep={currentStep}
                        integrityResult={integrityResult}
                        comparisonResult={comparisonResult}
                    />
                </div>
            </div>
        </div>
    );
}
