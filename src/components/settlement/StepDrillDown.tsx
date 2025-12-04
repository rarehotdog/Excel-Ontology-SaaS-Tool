import { TrendingUp, ArrowRight, Shield, GitCompare, AlertTriangle, Search, Filter, Download } from 'lucide-react';
import { SettlementMode } from './types';

interface StepDrillDownProps {
    mode: SettlementMode;
    onNext: () => void;
}

export function StepDrillDown({ mode, onNext }: StepDrillDownProps) {
    if (mode === 'integrity') {
        return (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield className="w-7 h-7 text-blue-600" />
                            상세 분석: 이상 패턴
                        </h2>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium">
                                <Filter className="w-4 h-4" />
                                필터
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium">
                                <Download className="w-4 h-4" />
                                내보내기
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Critical 항목 */}
                        <div className="p-5 bg-red-50 rounded-2xl border border-red-200">
                            <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Critical 이슈 상세 (100건)
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { type: '금액 불일치', count: 60, sample: '운임 25,000원 vs 카드 38,000원 (차이 13,000원)' },
                                    { type: '중복 거래', count: 25, sample: 'TXN-001234가 3회 중복 기록됨' },
                                    { type: '시스템 오류', count: 15, sample: '결제시각이 콜시각보다 이전 (음수 시간차)' },
                                ].map((issue, idx) => (
                                    <div key={idx} className="p-4 bg-white rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{issue.type}</span>
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                {issue.count}건
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">예시: {issue.sample}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Warning 항목 */}
                        <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-200">
                            <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Warning 이슈 상세 (200건)
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { type: '소액 차이', count: 120, sample: '운임 25,000원 vs 카드 26,500원 (차이 1,500원)' },
                                    { type: '시간 지연', count: 80, sample: '콜-결제 시간차 45분 (기준: 30분)' },
                                ].map((issue, idx) => (
                                    <div key={idx} className="p-4 bg-white rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{issue.type}</span>
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                                {issue.count}건
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">예시: {issue.sample}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI 분석 */}
                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200">
                            <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                AI 패턴 분석
                            </h3>
                            <div className="space-y-3 text-sm text-blue-900">
                                <p>• <strong>금액 불일치 패턴:</strong> 주로 야간 시간대(22:00-06:00) 발생, 심야할증 미적용 의심</p>
                                <p>• <strong>중복 거래 패턴:</strong> 특정 차량(서울12바3456) 집중 발생, 시스템 오류 확인 필요</p>
                                <p>• <strong>권장 조치:</strong> 해당 기간 심야할증 로직 점검, 중복 발생 차량 개별 확인</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onNext}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg transition-all font-medium"
                    >
                        <span>리포트 생성</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // 비교 분석 모드
    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <GitCompare className="w-7 h-7 text-purple-600" />
                        상세 분석: A/B 파일 비교
                    </h2>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium">
                            <Filter className="w-4 h-4" />
                            필터
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium">
                            <Download className="w-4 h-4" />
                            내보내기
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* 누락/추가 분석 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200">
                            <h3 className="font-bold text-blue-800 mb-4">A에만 존재 (누락 의심)</h3>
                            <div className="space-y-2">
                                {[
                                    { key: 'KEY-000123', amount: 150000, date: '2024-10-15' },
                                    { key: 'KEY-000456', amount: 230000, date: '2024-10-18' },
                                    { key: 'KEY-000789', amount: 180000, date: '2024-10-22' },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-3 bg-white rounded-xl flex justify-between items-center">
                                        <div>
                                            <span className="font-mono text-sm text-gray-800">{item.key}</span>
                                            <span className="text-xs text-gray-500 ml-2">{item.date}</span>
                                        </div>
                                        <span className="font-medium text-blue-700">{item.amount.toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 bg-pink-50 rounded-2xl border border-pink-200">
                            <h3 className="font-bold text-pink-800 mb-4">B에만 존재 (추가 의심)</h3>
                            <div className="space-y-2">
                                {[
                                    { key: 'KEY-001111', amount: 95000, date: '2024-10-12' },
                                    { key: 'KEY-002222', amount: 120000, date: '2024-10-19' },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-3 bg-white rounded-xl flex justify-between items-center">
                                        <div>
                                            <span className="font-mono text-sm text-gray-800">{item.key}</span>
                                            <span className="text-xs text-gray-500 ml-2">{item.date}</span>
                                        </div>
                                        <span className="font-medium text-pink-700">{item.amount.toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 금액 차이 분석 */}
                    <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-200">
                        <h3 className="font-bold text-yellow-800 mb-4">금액 차이 분석 (Top 5)</h3>
                        <div className="space-y-3">
                            {[
                                { key: 'KEY-003333', a: 5000000, b: 5500000, reason: 'VAT 미포함 추정' },
                                { key: 'KEY-004444', a: 3200000, b: 3000000, reason: '수수료 계산 차이' },
                                { key: 'KEY-005555', a: 1800000, b: 1850000, reason: '환율 차이' },
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 bg-white rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-sm text-gray-800">{item.key}</span>
                                        <span className={`font-bold ${item.b - item.a > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {(item.b - item.a > 0 ? '+' : '')}{(item.b - item.a).toLocaleString()}원
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>A: {item.a.toLocaleString()}원</span>
                                        <span>B: {item.b.toLocaleString()}원</span>
                                    </div>
                                    <div className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded inline-block">
                                        AI 추론: {item.reason}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI 종합 분석 */}
                    <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200">
                        <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            AI 종합 분석
                        </h3>
                        <div className="space-y-3 text-sm text-purple-900">
                            <p>• <strong>주요 차이 원인:</strong> VAT 포함/미포함 불일치가 전체 차이의 60%를 차지</p>
                            <p>• <strong>누락 패턴:</strong> A에만 존재하는 건은 주로 월말(25일 이후) 집중</p>
                            <p>• <strong>권장 조치:</strong> B 파일 담당자에게 VAT 처리 기준 확인 요청, 월말 마감 프로세스 점검</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg transition-all font-medium"
                >
                    <span>리포트 생성</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
