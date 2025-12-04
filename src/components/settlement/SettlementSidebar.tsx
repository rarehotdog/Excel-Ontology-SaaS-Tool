import { Sparkles } from 'lucide-react';
import { SettlementMode, StepType, MerchantResult, BusinessComparison } from './types';

interface SettlementSidebarProps {
    mode: SettlementMode;
    currentStep: StepType;
    merchantResults: MerchantResult;
    businessComparison: BusinessComparison;
}

export function SettlementSidebar({ mode, currentStep, merchantResults, businessComparison }: SettlementSidebarProps) {
    return (
        <div className="w-96 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 rounded-3xl p-1 shadow-xl shadow-teal-200/50">
            <div className="bg-white rounded-3xl p-6 h-full">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    AI Assistant
                </h3>

                {currentStep === 1 && mode === 'merchant' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                            <p className="text-sm text-gray-900 mb-3">
                                <strong>운임 Raw</strong>와 <strong>카드내역</strong>은 필수입니다.
                            </p>
                            <p className="text-xs text-gray-600">
                                빌링데이터를 추가하면 서비스이용료 대사가 가능합니다.
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 4 && mode === 'merchant' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200">
                            <p className="text-sm text-gray-900 mb-3">
                                총 <strong>{merchantResults.total.toLocaleString()}건</strong> 중 <strong>{merchantResults.issues}건({merchantResults.issueRate}%)</strong>이 이상건으로 탐지되었습니다.
                            </p>
                            <p className="text-xs text-gray-600 mb-2 font-medium">주요 원인:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• 카드 금액 불일치 (80건, 65%)</li>
                                <li>• 중복운임 (30건, 24%)</li>
                                <li>• 비정상 운행 (13건, 11%)</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                            <p className="text-sm text-gray-900 mb-2 font-medium">
                                💡 추천 액션
                            </p>
                            <p className="text-xs text-gray-600">
                                <strong>강남본부 주디가맹점</strong>의 이상건이 가장 많습니다. 우선적으로 검토하세요.
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 4 && mode === 'business' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                            <p className="text-sm text-gray-900 mb-3">
                                총 <strong>{businessComparison.totalItems}개</strong> 가맹점 중 <strong>{businessComparison.withDiff}개({businessComparison.diffRate}%)</strong>에서 의미 있는 차액이 발견되었습니다.
                            </p>
                            <p className="text-xs text-gray-600">
                                상위 3개 가맹점이 전체 차액의 대부분을 차지합니다.
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                            <p className="text-sm text-gray-900 mb-2 font-medium">
                                💡 추천 분석
                            </p>
                            <p className="text-xs text-gray-600">
                                <strong>강남본부 A지점</strong>의 차액이 ₩7.5M로 가장 큽니다. 원인을 먼저 분석하세요.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
