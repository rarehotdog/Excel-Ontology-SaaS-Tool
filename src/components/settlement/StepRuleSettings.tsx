import { Settings, Play } from 'lucide-react';
import { SettlementMode } from './types';

interface StepRuleSettingsProps {
    mode: SettlementMode;
    onNext: () => void;
}

export function StepRuleSettings({ mode, onNext }: StepRuleSettingsProps) {
    if (mode !== 'merchant') return null;

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Settings className="w-7 h-7 text-teal-600" />
                    정산 룰 설정
                </h2>
                <p className="text-gray-600 mb-6">어떤 이상 패턴을 탐지할지 설정하세요</p>

                <div className="space-y-4">
                    {[
                        {
                            id: 'duplicate',
                            name: '중복 운임 탐지',
                            desc: '동일 기사/차량/시간대에서 운임 2개 이상 발생',
                            params: ['시간 범위: ±10분', '차량번호 기준'],
                            color: 'blue'
                        },
                        {
                            id: 'abnormal',
                            name: '비정상 운행 탐지',
                            desc: '거리 대비 운행시간, 운임이 상식적 범위 벗어남',
                            params: ['거리/시간 비율 > 2.0', '운임/거리 비율 이상치'],
                            color: 'purple'
                        },
                        {
                            id: 'card-diff',
                            name: '카카오 콜 vs 카드내역 금액 차이',
                            desc: '허용 오차 이상의 금액 차이',
                            params: ['허용 오차: ±1원', '비율 오차: ±0.1%'],
                            color: 'orange'
                        },
                        {
                            id: 'billing-diff',
                            name: '빌링데이터 vs 서비스이용료 대사',
                            desc: '이용료+포인트 합이 서비스이용료와 불일치',
                            params: ['허용 오차: ±10원'],
                            color: 'emerald'
                        },
                    ].map((rule) => (
                        <div key={rule.id} className={`p-6 bg-gradient-to-br from-${rule.color}-50 to-${rule.color}-100 rounded-2xl border border-${rule.color}-200`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="w-5 h-5 rounded-lg text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-lg font-bold text-gray-900">{rule.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 ml-8">{rule.desc}</p>
                                </div>
                                <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm transition-all font-medium shadow-sm">
                                    상세설정
                                </button>
                            </div>
                            <div className="ml-8 flex flex-wrap gap-2 mt-3">
                                {rule.params.map((param, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-white text-gray-700 rounded-lg text-xs font-medium border border-gray-100">
                                        {param}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                    <Play className="w-5 h-5" />
                    <span>대사 실행</span>
                </button>
            </div>
        </div>
    );
}
