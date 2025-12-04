import { Link2, Sparkles, ArrowRight } from 'lucide-react';
import { SettlementMode } from './types';

interface StepKeyMappingProps {
    mode: SettlementMode;
    onNext: () => void;
}

export function StepKeyMapping({ mode, onNext }: StepKeyMappingProps) {
    if (mode !== 'merchant') return null; // Only for merchant mode in this design

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Link2 className="w-7 h-7 text-teal-600" />
                    키 매핑 설정
                </h2>
                <p className="text-gray-600 mb-6">각 데이터 소스를 어떤 기준으로 매칭할지 설정하세요</p>

                <div className="space-y-6">
                    {/* Mapping Rule 1 */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-bold text-blue-900">AI 추천 매핑</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 p-3 bg-white rounded-xl shadow-sm">
                                    <div className="text-xs text-gray-600 mb-1">운임 Raw</div>
                                    <div className="text-sm font-medium text-gray-900">운행시각 + 운임금액</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-blue-600" />
                                <div className="flex-1 p-3 bg-white rounded-xl shadow-sm">
                                    <div className="text-xs text-gray-600 mb-1">카드내역</div>
                                    <div className="text-sm font-medium text-gray-900">승인시각 (±5분) + 금액</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 p-3 bg-white rounded-xl shadow-sm">
                                    <div className="text-xs text-gray-600 mb-1">운임 Raw</div>
                                    <div className="text-sm font-medium text-gray-900">가맹점명</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-blue-600" />
                                <div className="flex-1 p-3 bg-white rounded-xl shadow-sm">
                                    <div className="text-xs text-gray-600 mb-1">빌링데이터</div>
                                    <div className="text-sm font-medium text-gray-900">가맹점ID</div>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium text-sm">
                            이 매핑 적용
                        </button>
                    </div>

                    {/* Manual Mapping */}
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">수동 매핑 추가</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">소스 A</label>
                                <select className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
                                    <option>운임 Raw</option>
                                    <option>카드내역</option>
                                    <option>빌링데이터</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">소스 B</label>
                                <select className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
                                    <option>카드내역</option>
                                    <option>빌링데이터</option>
                                    <option>운임 Raw</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">매칭 기준</label>
                                <select className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:outline-none">
                                    <option>시각 + 금액</option>
                                    <option>ID + 날짜</option>
                                    <option>차량번호 + 시각</option>
                                </select>
                            </div>
                        </div>
                        <button className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm transition-all font-medium">
                            + 매핑 추가
                        </button>
                    </div>
                </div>

                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                    <span>다음 단계: 룰 설정</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
