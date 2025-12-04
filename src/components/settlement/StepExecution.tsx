import { AlertCircle } from 'lucide-react';
import { SettlementMode, MerchantResult, BusinessComparison } from './types';

interface StepExecutionProps {
    mode: SettlementMode;
    merchantResults: MerchantResult;
    businessComparison: BusinessComparison;
    onNext: () => void;
}

export function StepExecution({ mode, merchantResults, businessComparison, onNext }: StepExecutionProps) {
    if (mode === 'merchant') {
        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 shadow-xl text-white">
                        <div className="text-sm mb-2 opacity-90 font-medium">전체 운행건수</div>
                        <div className="text-4xl font-bold mb-2">{merchantResults.total.toLocaleString()}</div>
                        <div className="text-sm opacity-75">건</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-xl text-white">
                        <div className="text-sm mb-2 opacity-90 font-medium">이상건수</div>
                        <div className="text-4xl font-bold mb-2">{merchantResults.issues.toLocaleString()}</div>
                        <div className="text-sm opacity-75">{merchantResults.issueRate}% 비율</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 shadow-xl text-white">
                        <div className="text-sm mb-2 opacity-90 font-medium">정상 처리율</div>
                        <div className="text-4xl font-bold mb-2">{(100 - merchantResults.issueRate).toFixed(1)}%</div>
                        <div className="text-sm opacity-75">{(merchantResults.total - merchantResults.issues).toLocaleString()}건</div>
                    </div>
                </div>

                {/* Issue Breakdown */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">이상 유형별 분석</h3>
                    <div className="space-y-4">
                        {merchantResults.byType.map((item, idx) => (
                            <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-600" />
                                        <span className="text-gray-900 font-medium">{item.type}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-bold text-orange-600">{item.count}건</span>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                            {item.rate}%
                                        </span>
                                    </div>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                                        style={{ width: `${item.rate}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">가맹본부별 이상건 요약</h3>
                    <div className="overflow-hidden rounded-2xl border-2 border-gray-200">
                        <table className="w-full text-sm">
                            <thead className="bg-gradient-to-r from-teal-50 to-teal-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">가맹본부</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">가맹점</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">전체</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">이상건</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">비율</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { branch: '강남본부', merchant: '주디가맹점', total: 1234, issues: 45, rate: 3.6 },
                                    { branch: '강남본부', merchant: 'A가맹점', total: 987, issues: 12, rate: 1.2 },
                                    { branch: '서초본부', merchant: 'B가맹점', total: 2341, issues: 18, rate: 0.8 },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-t border-gray-200 hover:bg-teal-50/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-900 font-medium">{row.branch}</td>
                                        <td className="px-4 py-3 text-gray-900">{row.merchant}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{row.total}</td>
                                        <td className="px-4 py-3 text-right text-orange-600 font-bold">{row.issues}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                                                {row.rate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={onNext}
                                                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs transition-all font-medium"
                                            >
                                                상세보기
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Business Mode
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-2 font-medium">전체 항목</div>
                    <div className="text-3xl font-bold">{businessComparison.totalItems}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-2 font-medium">차액 발생</div>
                    <div className="text-3xl font-bold">{businessComparison.withDiff}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-2 font-medium">차액율</div>
                    <div className="text-3xl font-bold">{businessComparison.diffRate}%</div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-2 font-medium">총 차액</div>
                    <div className="text-2xl font-bold">₩{(businessComparison.totalDiff / 1000000).toFixed(1)}M</div>
                </div>
            </div>

            {/* Diff Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6">차액 상위 가맹점</h3>
                <div className="overflow-hidden rounded-2xl border-2 border-gray-200">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">가맹점</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">A 매출</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">B 매출</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">차액</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">차액율</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {businessComparison.topDiffs.map((row, idx) => (
                                <tr key={idx} className="border-t border-gray-200 hover:bg-purple-50/50 transition-colors">
                                    <td className="px-4 py-3 text-gray-900 font-medium">{row.merchant}</td>
                                    <td className="px-4 py-3 text-right text-gray-700">₩{(row.a / 1000000).toFixed(1)}M</td>
                                    <td className="px-4 py-3 text-right text-gray-700">₩{(row.b / 1000000).toFixed(1)}M</td>
                                    <td className={`px-4 py-3 text-right font-bold ${row.diff > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                        {row.diff > 0 ? '+' : ''}₩{(row.diff / 1000000).toFixed(1)}M
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${Math.abs(row.rate) > 5 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {row.rate > 0 ? '+' : ''}{row.rate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={onNext}
                                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs transition-all font-medium"
                                        >
                                            분석
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
