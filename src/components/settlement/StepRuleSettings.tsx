import { Settings, ArrowRight, Shield, GitCompare, AlertTriangle, CheckCircle } from 'lucide-react';
import { SettlementMode } from './types';

export interface RuleConfig {
    // 무결성 모드 룰
    integrityRules?: {
        criticalAmountDiff: number;
        warningAmountDiff: number;
        detectDuplicates: boolean;
        timeThresholdMinutes: number;
    };
    // 비교 모드 룰
    comparisonRules?: {
        toleranceAmount: number;
        tolerancePercent: number;
        detectMissing: boolean;
        detectDiff: boolean;
        enableAIReasoning: boolean;
    };
}

interface StepRuleSettingsProps {
    mode: SettlementMode;
    onNext: () => void;
    config: RuleConfig | null;
    onConfigChange: (config: RuleConfig) => void;
}

export function StepRuleSettings({ mode, onNext, config, onConfigChange }: StepRuleSettingsProps) {
    // 무결성 모드
    if (mode === 'integrity') {
        const rules = config?.integrityRules || {
            criticalAmountDiff: 10000,
            warningAmountDiff: 1000,
            detectDuplicates: true,
            timeThresholdMinutes: 30,
        };
        
        const handleUpdate = (updates: Partial<typeof rules>) => {
            onConfigChange({
                ...config,
                integrityRules: { ...rules, ...updates },
            });
        };

        return (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Shield className="w-7 h-7 text-blue-600" />
                        이상 탐지 룰 설정
                    </h2>
                    <p className="text-gray-600 mb-6">
                        어떤 패턴을 이상으로 판단할지 설정하세요. Traffic Light 방식으로 표시됩니다.
                    </p>

                    <div className="space-y-4">
                        {/* Critical */}
                        <div className="p-5 bg-red-50 rounded-2xl border border-red-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                <h3 className="font-bold text-gray-900">Critical (빨강)</h3>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl">
                                    <span className="text-sm text-gray-700">금액 불일치 임계값</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">{'>'}</span>
                                        <input
                                            type="number"
                                            value={rules.criticalAmountDiff}
                                            onChange={(e) => handleUpdate({ criticalAmountDiff: Number(e.target.value) })}
                                            className="w-24 px-3 py-1 border border-red-200 rounded-lg text-right"
                                        />
                                        <span className="text-sm text-gray-500">원</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                    <input 
                                        type="checkbox" 
                                        checked={rules.detectDuplicates}
                                        onChange={(e) => handleUpdate({ detectDuplicates: e.target.checked })}
                                        className="w-4 h-4 text-red-500" 
                                    />
                                    <span className="text-sm text-gray-700">중복 거래 ID 탐지</span>
                                </label>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                                <h3 className="font-bold text-gray-900">Warning (노랑)</h3>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl">
                                    <span className="text-sm text-gray-700">금액 불일치 범위</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={rules.warningAmountDiff}
                                            onChange={(e) => handleUpdate({ warningAmountDiff: Number(e.target.value) })}
                                            className="w-24 px-3 py-1 border border-yellow-200 rounded-lg text-right"
                                        />
                                        <span className="text-sm text-gray-500">~</span>
                                        <span className="text-sm text-gray-700">{rules.criticalAmountDiff.toLocaleString()}원</span>
                                    </div>
                                </label>
                                <label className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl">
                                    <span className="text-sm text-gray-700">시간 차이 임계값</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">{'>'}</span>
                                        <input
                                            type="number"
                                            value={rules.timeThresholdMinutes}
                                            onChange={(e) => handleUpdate({ timeThresholdMinutes: Number(e.target.value) })}
                                            className="w-20 px-3 py-1 border border-yellow-200 rounded-lg text-right"
                                        />
                                        <span className="text-sm text-gray-500">분</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Normal */}
                        <div className="p-5 bg-green-50 rounded-2xl border border-green-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                <h3 className="font-bold text-gray-900">Normal (초록)</h3>
                            </div>
                            <p className="text-sm text-gray-600">위 조건에 해당하지 않는 정상 데이터</p>
                        </div>
                    </div>

                    <button
                        onClick={onNext}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg transition-all font-medium"
                    >
                        <span>대사 실행</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // 비교 분석 모드
    const rules = config?.comparisonRules || {
        toleranceAmount: 100,
        tolerancePercent: 0.1,
        detectMissing: true,
        detectDiff: true,
        enableAIReasoning: true,
    };
    
    const handleUpdate = (updates: Partial<typeof rules>) => {
        onConfigChange({
            ...config,
            comparisonRules: { ...rules, ...updates },
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <GitCompare className="w-7 h-7 text-purple-600" />
                    비교 분석 옵션
                </h2>
                <p className="text-gray-600 mb-6">
                    A/B 파일 비교 시 적용할 옵션들을 설정하세요.
                </p>

                <div className="space-y-4">
                    {/* 허용 오차 */}
                    <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-purple-600" />
                            허용 오차 설정
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">금액 허용 오차</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={rules.toleranceAmount}
                                        onChange={(e) => handleUpdate({ toleranceAmount: Number(e.target.value) })}
                                        className="flex-1 px-4 py-3 bg-white border border-purple-200 rounded-xl"
                                    />
                                    <span className="text-sm text-gray-500">원</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">비율 허용 오차</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={rules.tolerancePercent}
                                        onChange={(e) => handleUpdate({ tolerancePercent: Number(e.target.value) })}
                                        step={0.01}
                                        className="flex-1 px-4 py-3 bg-white border border-purple-200 rounded-xl"
                                    />
                                    <span className="text-sm text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 분석 옵션 */}
                    <div className="p-5 bg-white rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                            분석 옵션
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                                <input 
                                    type="checkbox" 
                                    checked={rules.detectMissing}
                                    onChange={(e) => handleUpdate({ detectMissing: e.target.checked })}
                                    className="w-4 h-4 text-purple-500" 
                                />
                                <span className="text-sm text-gray-700">누락 건 탐지 (A에만 있음 / B에만 있음)</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                                <input 
                                    type="checkbox" 
                                    checked={rules.detectDiff}
                                    onChange={(e) => handleUpdate({ detectDiff: e.target.checked })}
                                    className="w-4 h-4 text-purple-500" 
                                />
                                <span className="text-sm text-gray-700">금액 차이 분석</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                                <input 
                                    type="checkbox" 
                                    checked={rules.enableAIReasoning}
                                    onChange={(e) => handleUpdate({ enableAIReasoning: e.target.checked })}
                                    className="w-4 h-4 text-purple-500" 
                                />
                                <span className="text-sm text-gray-700">AI 추론 (차이 원인 분석)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg transition-all font-medium"
                >
                    <span>비교 분석 실행</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
