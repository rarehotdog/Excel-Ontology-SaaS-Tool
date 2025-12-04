import { Bot, Shield, GitCompare, AlertTriangle, TrendingUp, FileSearch, Mail, Lightbulb } from 'lucide-react';
import { SettlementMode, StepType, IntegrityResult, ComparisonResult } from './types';

interface SettlementSidebarProps {
    mode: SettlementMode;
    currentStep: StepType;
    integrityResult: IntegrityResult;
    comparisonResult: ComparisonResult;
}

export function SettlementSidebar({ mode, currentStep, integrityResult, comparisonResult }: SettlementSidebarProps) {
    return (
        <div className="w-80 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-purple-100/50 h-fit">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">AI 어시스턴트</h3>
                    <p className="text-xs text-gray-600">정산 분석 도우미</p>
                </div>
            </div>

            {/* 무결성 검증 모드 */}
            {mode === 'integrity' && (
                <>
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-bold text-gray-900">무결성 검증 모드</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    여러 데이터 소스를 동시에 비교하여 이상 패턴을 탐지합니다.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-bold text-gray-900">Tips</span>
                                </div>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• 필수 소스를 먼저 선택하세요</li>
                                    <li>• 여러 파일 동시 업로드 가능</li>
                                    <li>• 10,000행 이상도 처리됩니다</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-bold text-gray-900">Traffic Light 분석</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-xs text-gray-700">Critical: 즉시 확인 필요</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-xs text-gray-700">Warning: 검토 권장</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-xs text-gray-700">Normal: 정상</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
                                <p className="text-sm text-gray-900 font-medium">
                                    발견된 이상: <span className="text-red-600">{integrityResult.issues}건</span>
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    전체 대비 {integrityResult.issueRate}%
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* 비교 분석 모드 */}
            {mode === 'comparison' && (
                <>
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <GitCompare className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-bold text-gray-900">비교 분석 모드</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    A/B 두 파일을 비교하여 차이점과 누락 항목을 분석합니다.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-bold text-gray-900">Tips</span>
                                </div>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• A: 기준 파일 (내부 데이터)</li>
                                    <li>• B: 비교 파일 (외부 데이터)</li>
                                    <li>• 동일한 키 컬럼 필요</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileSearch className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-bold text-gray-900">Gap Analysis</span>
                                </div>
                                <p className="text-sm text-gray-900 mb-3">
                                    A/B 파일 간 <strong>누락 건</strong>과 <strong>차이 건</strong>을 자동 탐지했습니다.
                                </p>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">A에만 존재</span>
                                        <span className="font-medium">150건</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-pink-700">B에만 존재</span>
                                        <span className="font-medium">100건</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-yellow-700">금액 차이</span>
                                        <span className="font-medium">100건</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm font-bold text-gray-900">누락 탐정</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                    누락된 건을 발견하면 <strong>[이메일 작성]</strong> 버튼으로 AI가 자동 생성한 요청 메일을 바로 보낼 수 있습니다.
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl border border-teal-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-teal-600" />
                                    <span className="text-sm font-bold text-gray-900">AI 추론</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    각 차이 건에 대해 AI가 <strong>추정 원인</strong>을 자동으로 분석합니다. "VAT 미포함", "환율 차이" 등.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* 기본 상태 */}
            {![1, 4].includes(currentStep) && (
                <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-sm text-gray-700">
                        {mode === 'integrity' ? (
                            <>무결성 검증 모드에서 여러 데이터 소스를 비교하여 이상을 탐지합니다.</>
                        ) : (
                            <>비교 분석 모드에서 A/B 파일 간 차이점을 분석합니다.</>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
