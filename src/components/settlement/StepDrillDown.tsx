import { TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { SettlementMode } from './types';

interface StepDrillDownProps {
    mode: SettlementMode;
    onNext: () => void;
}

export function StepDrillDown({ mode, onNext }: StepDrillDownProps) {
    if (mode !== 'merchant') return null;

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <TrendingUp className="w-7 h-7 text-teal-600" />
                        상세 검토: 강남본부 - 주디가맹점
                    </h2>
                    <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all font-medium">
                        목록으로
                    </button>
                </div>

                {/* Detail Records */}
                <div className="space-y-3">
                    {[
                        {
                            id: 1,
                            time: '2024-10-15 14:23:45',
                            vehicle: '12가1234',
                            driver: '김철수',
                            kakaoFare: 15000,
                            cardFare: 15001,
                            issue: '카드 금액 불일치',
                            diff: 1
                        },
                        {
                            id: 2,
                            time: '2024-10-15 16:45:12',
                            vehicle: '34나5678',
                            driver: '이영희',
                            kakaoFare: 22000,
                            cardFare: 22000,
                            issue: '중복 운임',
                            diff: 0
                        },
                    ].map((record) => (
                        <div key={record.id} className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    <span className="text-sm px-3 py-1 bg-orange-200 text-orange-800 rounded-full font-medium">
                                        {record.issue}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-600 font-mono">{record.time}</span>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div>
                                    <div className="text-xs font-medium text-gray-600 mb-1">차량번호</div>
                                    <div className="text-sm text-gray-900">{record.vehicle}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-600 mb-1">기사명</div>
                                    <div className="text-sm text-gray-900">{record.driver}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-600 mb-1">카카오 운임</div>
                                    <div className="text-sm text-gray-900 font-mono">₩{record.kakaoFare.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-600 mb-1">카드 운임</div>
                                    <div className="text-sm text-gray-900 font-mono">₩{record.cardFare.toLocaleString()}</div>
                                </div>
                            </div>

                            {record.diff !== 0 && (
                                <div className="p-3 bg-white rounded-xl mb-4 border border-orange-100">
                                    <div className="text-xs font-medium text-gray-600 mb-1">금액 차이</div>
                                    <div className="text-lg font-bold text-orange-600">₩{record.diff}</div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm transition-all font-medium">
                                    정상 처리로 인정
                                </button>
                                <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-all font-medium">
                                    제외
                                </button>
                                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm transition-all font-medium">
                                    수동 수정
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                    <span>검토 완료 - 정산내역서 생성</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
