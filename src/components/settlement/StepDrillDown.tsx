import { useMemo } from 'react';
import { TrendingUp, ArrowRight, Shield, GitCompare, AlertTriangle, Search, Filter, Download, XCircle, CheckCircle } from 'lucide-react';
import { SettlementMode, IntegrityRow, DiffRow, GapSummary } from './types';

interface StepDrillDownProps {
    mode: SettlementMode;
    onNext: () => void;
    executionResult?: {
        integrityData: IntegrityRow[];
        diffData: DiffRow[];
        gapSummary: GapSummary | null;
    } | null;
}

export function StepDrillDown({ mode, onNext, executionResult }: StepDrillDownProps) {
    // 무결성 데이터 분석
    const integrityAnalysis = useMemo(() => {
        const data = executionResult?.integrityData || [];
        if (data.length === 0) return null;
        
        const critical = data.filter(d => d.status === 'critical');
        const warning = data.filter(d => d.status === 'warning');
        
        // 이슈 유형별 그룹화
        const criticalByType: Record<string, IntegrityRow[]> = {};
        const warningByType: Record<string, IntegrityRow[]> = {};
        
        critical.forEach(row => {
            const type = row.issueType || '기타';
            if (!criticalByType[type]) criticalByType[type] = [];
            criticalByType[type].push(row);
        });
        
        warning.forEach(row => {
            const type = row.issueType || '기타';
            if (!warningByType[type]) warningByType[type] = [];
            warningByType[type].push(row);
        });
        
        return { critical, warning, criticalByType, warningByType };
    }, [executionResult]);
    
    // 비교 데이터 분석
    const comparisonAnalysis = useMemo(() => {
        const data = executionResult?.diffData || [];
        const summary = executionResult?.gapSummary;
        if (data.length === 0 || !summary) return null;
        
        const aOnly = data.filter(d => d.source === 'a_only').slice(0, 5);
        const bOnly = data.filter(d => d.source === 'b_only').slice(0, 5);
        const topDiffs = data
            .filter(d => d.source === 'intersection' && d.diffAmount !== 0)
            .sort((a, b) => Math.abs(b.diffAmount) - Math.abs(a.diffAmount))
            .slice(0, 5);
        
        return { aOnly, bOnly, topDiffs, summary };
    }, [executionResult]);

    if (mode === 'integrity') {
        const analysis = integrityAnalysis;
        
        return (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield className="w-7 h-7 text-blue-600" />
                            상세 분석: 이상 패턴
                            {analysis && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">
                                    실제 데이터
                                </span>
                            )}
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
                                <XCircle className="w-5 h-5" />
                                Critical 이슈 상세 ({analysis?.critical.length || 100}건)
                            </h3>
                            <div className="space-y-3">
                                {analysis ? (
                                    Object.entries(analysis.criticalByType).map(([type, rows]) => (
                                        <div key={type} className="p-4 bg-white rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900">{type}</span>
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                    {rows.length}건
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                예시: {rows[0]?.issueReason || `${type} 발생`}
                                            </p>
                                            <div className="mt-2 text-xs text-gray-500">
                                                샘플 ID: {rows.slice(0, 3).map(r => r.id).join(', ')}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Mock 데이터
                                    [
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
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Warning 항목 */}
                        <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-200">
                            <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Warning 이슈 상세 ({analysis?.warning.length || 200}건)
                            </h3>
                            <div className="space-y-3">
                                {analysis ? (
                                    Object.entries(analysis.warningByType).map(([type, rows]) => (
                                        <div key={type} className="p-4 bg-white rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900">{type}</span>
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                                    {rows.length}건
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                예시: {rows[0]?.issueReason || `${type} 발생`}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    [
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
                                    ))
                                )}
                            </div>
                        </div>

                        {/* AI 분석 */}
                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200">
                            <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                AI 패턴 분석
                            </h3>
                            <div className="space-y-3 text-sm text-blue-900">
                                {analysis ? (
                                    <>
                                        <p>• <strong>금액 불일치 패턴:</strong> 총 {analysis.critical.filter(r => r.issueType?.includes('금액')).length}건 탐지됨</p>
                                        <p>• <strong>시간 관련 이슈:</strong> {analysis.warning.filter(r => r.issueType?.includes('시간')).length}건의 시간 지연 발생</p>
                                        <p>• <strong>권장 조치:</strong> Critical 항목 우선 검토, 반복 패턴 확인 필요</p>
                                    </>
                                ) : (
                                    <>
                                        <p>• <strong>금액 불일치 패턴:</strong> 주로 야간 시간대(22:00-06:00) 발생, 심야할증 미적용 의심</p>
                                        <p>• <strong>중복 거래 패턴:</strong> 특정 차량(서울12바3456) 집중 발생, 시스템 오류 확인 필요</p>
                                        <p>• <strong>권장 조치:</strong> 해당 기간 심야할증 로직 점검, 중복 발생 차량 개별 확인</p>
                                    </>
                                )}
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
    const analysis = comparisonAnalysis;
    
    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <GitCompare className="w-7 h-7 text-purple-600" />
                        상세 분석: A/B 파일 비교
                        {analysis && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">
                                실제 데이터
                            </span>
                        )}
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
                            <h3 className="font-bold text-blue-800 mb-4">
                                A에만 존재 (누락 의심) - {analysis?.summary.aOnlyCount || 150}건
                            </h3>
                            <div className="space-y-2">
                                {(analysis?.aOnly || [
                                    { keyId: 'KEY-000123', fileAValue: 150000, transactionDate: '2024-10-15' },
                                    { keyId: 'KEY-000456', fileAValue: 230000, transactionDate: '2024-10-18' },
                                    { keyId: 'KEY-000789', fileAValue: 180000, transactionDate: '2024-10-22' },
                                ]).map((item, idx) => (
                                    <div key={idx} className="p-3 bg-white rounded-xl flex justify-between items-center">
                                        <div>
                                            <span className="font-mono text-sm text-gray-800">{item.keyId}</span>
                                            <span className="text-xs text-gray-500 ml-2">{item.transactionDate}</span>
                                        </div>
                                        <span className="font-medium text-blue-700">{item.fileAValue.toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 bg-pink-50 rounded-2xl border border-pink-200">
                            <h3 className="font-bold text-pink-800 mb-4">
                                B에만 존재 (추가 의심) - {analysis?.summary.bOnlyCount || 100}건
                            </h3>
                            <div className="space-y-2">
                                {(analysis?.bOnly || [
                                    { keyId: 'KEY-001111', fileBValue: 95000, transactionDate: '2024-10-12' },
                                    { keyId: 'KEY-002222', fileBValue: 120000, transactionDate: '2024-10-19' },
                                ]).map((item, idx) => (
                                    <div key={idx} className="p-3 bg-white rounded-xl flex justify-between items-center">
                                        <div>
                                            <span className="font-mono text-sm text-gray-800">{item.keyId}</span>
                                            <span className="text-xs text-gray-500 ml-2">{item.transactionDate}</span>
                                        </div>
                                        <span className="font-medium text-pink-700">{item.fileBValue.toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 금액 차이 분석 */}
                    <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-200">
                        <h3 className="font-bold text-yellow-800 mb-4">
                            금액 차이 분석 (Top 5) - 총 {analysis?.summary.diffCount || 100}건
                        </h3>
                        <div className="space-y-3">
                            {(analysis?.topDiffs || [
                                { keyId: 'KEY-003333', fileAValue: 5000000, fileBValue: 5500000, diffAmount: 500000, aiReasoning: 'VAT 미포함 추정' },
                                { keyId: 'KEY-004444', fileAValue: 3200000, fileBValue: 3000000, diffAmount: -200000, aiReasoning: '수수료 계산 차이' },
                                { keyId: 'KEY-005555', fileAValue: 1800000, fileBValue: 1850000, diffAmount: 50000, aiReasoning: '환율 차이' },
                            ]).map((item, idx) => (
                                <div key={idx} className="p-4 bg-white rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-sm text-gray-800">{item.keyId}</span>
                                        <span className={`font-bold ${item.diffAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.diffAmount > 0 ? '+' : ''}{item.diffAmount.toLocaleString()}원
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>A: {item.fileAValue.toLocaleString()}원</span>
                                        <span>B: {item.fileBValue.toLocaleString()}원</span>
                                    </div>
                                    {item.aiReasoning && (
                                        <div className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded inline-block">
                                            AI 추론: {item.aiReasoning}
                                        </div>
                                    )}
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
                            {analysis ? (
                                <>
                                    <p>• <strong>전체 비교 건수:</strong> {analysis.summary.matchedCount + analysis.summary.aOnlyCount + analysis.summary.bOnlyCount}건</p>
                                    <p>• <strong>누락 건:</strong> A에만 {analysis.summary.aOnlyCount}건 ({analysis.summary.aOnlyAmount.toLocaleString()}원), B에만 {analysis.summary.bOnlyCount}건</p>
                                    <p>• <strong>차이 발생:</strong> {analysis.summary.diffCount}건, 총 차액 {analysis.summary.totalDiffAmount.toLocaleString()}원</p>
                                </>
                            ) : (
                                <>
                                    <p>• <strong>주요 차이 원인:</strong> VAT 포함/미포함 불일치가 전체 차이의 60%를 차지</p>
                                    <p>• <strong>누락 패턴:</strong> A에만 존재하는 건은 주로 월말(25일 이후) 집중</p>
                                    <p>• <strong>권장 조치:</strong> B 파일 담당자에게 VAT 처리 기준 확인 요청, 월말 마감 프로세스 점검</p>
                                </>
                            )}
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
