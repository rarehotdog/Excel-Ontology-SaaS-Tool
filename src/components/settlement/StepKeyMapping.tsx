import { Link2, ArrowRight, Shield, GitCompare, CheckCircle } from 'lucide-react';
import { SettlementMode } from './types';

interface StepKeyMappingProps {
    mode: SettlementMode;
    onNext: () => void;
}

export function StepKeyMapping({ mode, onNext }: StepKeyMappingProps) {
    if (mode === 'integrity') {
        return (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Shield className="w-7 h-7 text-blue-600" />
                        다중 소스 키 매핑
                    </h2>
                    <p className="text-gray-600 mb-6">
                        여러 파일들을 어떤 기준으로 매칭할지 설정하세요.
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">1</span>
                                </div>
                                <h3 className="font-bold text-gray-900">운임 Raw - 카드내역</h3>
                                <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> AI 추천
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="p-3 bg-white rounded-xl">
                                    <div className="text-gray-500 text-xs mb-1">운임 Raw</div>
                                    <div className="font-medium text-gray-900">차량번호 + 운행시각</div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <Link2 className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="p-3 bg-white rounded-xl">
                                    <div className="text-gray-500 text-xs mb-1">카드내역</div>
                                    <div className="font-medium text-gray-900">가맹점ID + 승인시각</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">2</span>
                                </div>
                                <h3 className="font-bold text-gray-900">운임 Raw - 빌링데이터</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <select className="p-3 bg-white rounded-xl border border-gray-200">
                                    <option>가맹점명</option>
                                    <option>차량번호</option>
                                </select>
                                <div className="flex items-center justify-center">
                                    <Link2 className="w-5 h-5 text-gray-400" />
                                </div>
                                <select className="p-3 bg-white rounded-xl border border-gray-200">
                                    <option>가맹점ID</option>
                                    <option>정산일자</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onNext}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg transition-all font-medium"
                    >
                        <span>다음: 검증 룰 설정</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <GitCompare className="w-7 h-7 text-purple-600" />
                    비교 키 설정
                </h2>
                <p className="text-gray-600 mb-6">
                    A/B 파일을 어떤 기준으로 비교할지 설정합니다.
                </p>

                <div className="space-y-6">
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                        <h3 className="font-bold text-gray-900 mb-4">Primary Key (매칭 기준)</h3>
                        <div className="flex gap-3">
                            {['거래ID', '가맹점ID', '정산일자'].map((key, idx) => (
                                <button
                                    key={key}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                        idx === 0
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200'
                                    }`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 bg-white rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">비교 컬럼 매핑</h3>
                        <div className="space-y-3">
                            {[
                                { a: '정산금액', b: '지급금액' },
                                { a: '수수료', b: '수수료금액' },
                            ].map((mapping, idx) => (
                                <div key={idx} className="grid grid-cols-5 gap-3 items-center">
                                    <div className="col-span-2 p-3 bg-blue-50 rounded-xl text-sm font-medium text-gray-800">
                                        A: {mapping.a}
                                    </div>
                                    <div className="flex justify-center">
                                        <Link2 className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div className="col-span-2 p-3 bg-purple-50 rounded-xl text-sm font-medium text-gray-800">
                                        B: {mapping.b}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg transition-all font-medium"
                >
                    <span>다음: 분석 옵션 설정</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
