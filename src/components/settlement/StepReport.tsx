import { CheckCircle, Sparkles, FileSpreadsheet, Download } from 'lucide-react';
import { SettlementMode } from './types';

interface StepReportProps {
    mode: SettlementMode;
}

export function StepReport({ mode }: StepReportProps) {
    if (mode !== 'merchant') return null;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-1 shadow-xl shadow-teal-200/50">
                <div className="bg-white rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <CheckCircle className="w-7 h-7 text-teal-600" />
                        정산내역서 생성
                    </h2>

                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl mb-6 border border-emerald-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-6 h-6 text-emerald-600" />
                            <span className="text-lg font-bold text-gray-900">자연어로 리포트 구조 지정</span>
                        </div>
                        <textarea
                            className="w-full h-32 px-4 py-3 bg-white border-2 border-emerald-200 rounded-2xl text-gray-900 resize-none focus:outline-none focus:border-emerald-400"
                            placeholder="예: 주디가맹본부/주디운수/서울12바1234 차량/김주디 기사/1,000원 형식의 합계표를 만들어줘. 가맹본부→가맹점→차량/기사 순으로 그룹핑하고, 합계표는 시트 1장으로 정리해줘."
                            defaultValue="주디가맹본부/주디운수/서울12바1234 차량/김주디 기사/1,000원 형식의 합계표를 만들어줘. 가맹본부→가맹점→차량/기사 순으로 그룹핑하고, 합계표는 시트 1장으로 정리해줘."
                        />
                        <button className="w-full mt-4 px-6 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl transition-all font-medium shadow-md">
                            리포트 생성
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-6 h-6 text-teal-600" />
                                    <span className="text-lg font-bold text-gray-900">정산내역서_2024_10.xlsx</span>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    생성 완료
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                전체 12,222건 (이상건 제외 후) / 총 운임 ₩1,234,567,890
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all font-medium flex items-center justify-center">
                                    <Download className="w-5 h-5 inline mr-2" />
                                    Excel 다운로드
                                </button>
                                <button className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-medium flex items-center justify-center">
                                    <Download className="w-5 h-5 inline mr-2" />
                                    PDF 다운로드
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
