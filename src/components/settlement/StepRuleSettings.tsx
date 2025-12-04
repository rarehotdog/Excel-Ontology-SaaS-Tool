import { Settings, ArrowRight, Shield, GitCompare, AlertTriangle, CheckCircle } from 'lucide-react';
import { SettlementMode } from './types';

interface StepRuleSettingsProps {
    mode: SettlementMode;
    onNext: () => void;
}

export function StepRuleSettings({ mode, onNext }: StepRuleSettingsProps) {
    if (mode === 'integrity') {
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
                        <div className="p-5 bg-red-50 rounded-2xl border border-red-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                <h3 className="font-bold text-gray-900">Critical (빨강)</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-gray-700">금액 불일치 {'>'} 10,000원</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-gray-700">중복 거래 ID 탐지</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                                <h3 className="font-bold text-gray-900">Warning (노랑)</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm text-gray-700">금액 불일치 1,000 ~ 10,000원</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm text-gray-700">시간 차이 {'>'} 30분</span>
                                </label>
                            </div>
                        </div>

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
                    <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-purple-600" />
                            허용 오차 설정
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">금액 허용 오차</label>
                                <input
                                    type="number"
                                    defaultValue={100}
                                    className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">비율 허용 오차 (%)</label>
                                <input
                                    type="number"
                                    defaultValue={0.1}
                                    step={0.01}
                                    className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-white rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                            분석 옵션
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500" />
                                <span className="text-sm text-gray-700">누락 건 탐지 (A에만 있음 / B에만 있음)</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500" />
                                <span className="text-sm text-gray-700">금액 차이 분석</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500" />
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
