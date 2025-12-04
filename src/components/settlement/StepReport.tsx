import { Download, CheckCircle, FileSpreadsheet, Mail, Shield, GitCompare } from 'lucide-react';
import { SettlementMode } from './types';

interface StepReportProps {
    mode: SettlementMode;
}

export function StepReport({ mode }: StepReportProps) {
    if (mode === 'integrity') {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-1 shadow-xl shadow-blue-200/50">
                    <div className="bg-white rounded-3xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Shield className="w-7 h-7 text-blue-600" />
                            무결성 검증 리포트
                        </h2>

                        <div className="p-6 bg-green-50 rounded-2xl border border-green-200 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <div>
                                    <h3 className="text-xl font-bold text-green-800">검증 완료</h3>
                                    <p className="text-green-700">총 12,345건 중 300건 이상 탐지 (2.4%)</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <h3 className="font-bold text-gray-900">리포트 요약</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-gray-900">12,345</div>
                                    <div className="text-sm text-gray-600">총 검증 건수</div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-red-600">100</div>
                                    <div className="text-sm text-red-700">Critical</div>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-yellow-600">200</div>
                                    <div className="text-sm text-yellow-700">Warning</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-900">내보내기 옵션</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-3 p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all">
                                    <FileSpreadsheet className="w-5 h-5" />
                                    <span className="font-medium">Excel 다운로드</span>
                                </button>
                                <button className="flex items-center justify-center gap-3 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all">
                                    <Download className="w-5 h-5" />
                                    <span className="font-medium">PDF 리포트</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2">다음 권장 액션</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Critical 이슈 100건에 대한 개별 확인 필요</li>
                                <li>• 심야할증 로직 점검 권장</li>
                                <li>• 다음 정산 전 데이터 정합성 재확인</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 비교 분석 모드
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-1 shadow-xl shadow-purple-200/50">
                <div className="bg-white rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <GitCompare className="w-7 h-7 text-purple-600" />
                        비교 분석 리포트
                    </h2>

                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-8 h-8 text-purple-500" />
                            <div>
                                <h3 className="text-xl font-bold text-purple-800">분석 완료</h3>
                                <p className="text-purple-700">총 2,000건 비교 완료, 차이 발견 350건</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <h3 className="font-bold text-gray-900">분석 요약</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-gray-900">2,000</div>
                                <div className="text-sm text-gray-600">총 비교 건수</div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-blue-600">150</div>
                                <div className="text-sm text-blue-700">A에만 존재</div>
                            </div>
                            <div className="p-4 bg-pink-50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-pink-600">100</div>
                                <div className="text-sm text-pink-700">B에만 존재</div>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-yellow-600">100</div>
                                <div className="text-sm text-yellow-700">금액 차이</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <h3 className="font-bold text-gray-900">내보내기 옵션</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all">
                                <FileSpreadsheet className="w-5 h-5" />
                                <span className="font-medium">전체 결과 Excel</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl transition-all">
                                <Download className="w-5 h-5" />
                                <span className="font-medium">차이분만 Excel</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <h4 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            담당자 통보
                        </h4>
                        <p className="text-sm text-orange-700 mb-3">
                            분석 결과를 기반으로 담당자에게 확인 요청 메일을 보냅니다.
                        </p>
                        <button className="w-full flex items-center justify-center gap-2 p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all font-medium">
                            <Mail className="w-4 h-4" />
                            이메일 작성 및 발송
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
