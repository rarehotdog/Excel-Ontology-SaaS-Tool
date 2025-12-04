import { FileSpreadsheet, CheckCircle, ArrowRight } from 'lucide-react';
import { SettlementMode, StepType, MerchantSource } from './types';

interface StepFileSelectionProps {
    mode: SettlementMode;
    merchantSources: MerchantSource[];
    selectedSources: string[];
    onToggleSource: (id: string) => void;
    onNext: () => void;
}

export function StepFileSelection({ mode, merchantSources, selectedSources, onToggleSource, onNext }: StepFileSelectionProps) {
    if (mode === 'merchant') {
        return (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <FileSpreadsheet className="w-7 h-7 text-teal-600" />
                        데이터 소스 선택
                    </h2>
                    <div className="space-y-4">
                        {merchantSources.map((source) => (
                            <div
                                key={source.id}
                                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${source.selected
                                    ? 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-300'
                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => onToggleSource(source.id)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className={`w-6 h-6 ${source.selected ? 'text-teal-600' : 'text-gray-400'}`} />
                                        <div>
                                            <div className="text-lg font-bold text-gray-900">{source.name}</div>
                                            <div className="text-sm text-gray-600">{source.file}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {source.required && (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">필수</span>
                                        )}
                                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                                            {source.sheets} sheet(s)
                                        </span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${source.selected
                                            ? 'bg-teal-500 border-teal-500'
                                            : 'bg-white border-gray-300'
                                            }`}>
                                            {source.selected && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </div>
                                {source.selected && (
                                    <div className="mt-4 pt-4 border-t border-teal-200">
                                        <div className="text-xs font-medium text-gray-600 mb-2">Preview Schema</div>
                                        <div className="flex flex-wrap gap-2">
                                            {source.id === 'fare' && ['지역본부', '가맹점명', '차량번호', '기사명', '운행시각', '운임금액'].map(col => (
                                                <span key={col} className="px-2 py-1 bg-white text-gray-700 rounded-lg text-xs border border-gray-100">
                                                    {col}
                                                </span>
                                            ))}
                                            {source.id === 'card' && ['승인번호', '승인시각', '금액', '카드번호', '가맹점ID'].map(col => (
                                                <span key={col} className="px-2 py-1 bg-white text-gray-700 rounded-lg text-xs border border-gray-100">
                                                    {col}
                                                </span>
                                            ))}
                                            {source.id === 'billing' && ['가맹점ID', '이용료금액', '포인트사용금액', '정산일자'].map(col => (
                                                <span key={col} className="px-2 py-1 bg-white text-gray-700 rounded-lg text-xs border border-gray-100">
                                                    {col}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={onNext}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
                    >
                        <span>다음 단계: 키 매핑</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // Business Mode
    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">A/B 파일 선택</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">A 파일</h3>
                        <select className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl mb-3 focus:outline-none focus:border-blue-400">
                            <option>2024_10_매출리포트_A.xlsx</option>
                            <option>2024_09_매출리포트_A.xlsx</option>
                        </select>
                        <select className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400">
                            <option>Sheet1</option>
                            <option>Sheet2</option>
                        </select>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-300">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">B 파일</h3>
                        <select className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl mb-3 focus:outline-none focus:border-purple-400">
                            <option>2024_10_매출리포트_B.xlsx</option>
                            <option>2024_09_매출리포트_B.xlsx</option>
                        </select>
                        <select className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400">
                            <option>Sheet1</option>
                            <option>Sheet2</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                    <span>다음: 피벗 기준 설정</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
