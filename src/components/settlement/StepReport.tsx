import { useMemo, useState } from 'react';
import { Download, CheckCircle, FileSpreadsheet, Mail, Shield, GitCompare, Loader2 } from 'lucide-react';
import { SettlementMode, IntegrityResult, ComparisonResult, IntegrityRow, DiffRow, GapSummary } from './types';
import * as XLSX from 'xlsx';

interface StepReportProps {
    mode: SettlementMode;
    executionResult?: {
        integrityData: IntegrityRow[];
        diffData: DiffRow[];
        gapSummary: GapSummary | null;
    } | null;
    integrityResult: IntegrityResult;
    comparisonResult: ComparisonResult;
}

export function StepReport({ mode, executionResult, integrityResult, comparisonResult }: StepReportProps) {
    const [isExporting, setIsExporting] = useState(false);
    
    // 실제 데이터 통계 계산
    const stats = useMemo(() => {
        if (mode === 'integrity') {
            const data = executionResult?.integrityData || [];
            if (data.length === 0) {
                return {
                    total: integrityResult.total,
                    critical: integrityResult.byType[0]?.count || 100,
                    warning: integrityResult.byType[1]?.count || 200,
                    normal: integrityResult.total - integrityResult.issues,
                };
            }
            return {
                total: data.length,
                critical: data.filter(d => d.status === 'critical').length,
                warning: data.filter(d => d.status === 'warning').length,
                normal: data.filter(d => d.status === 'normal').length,
            };
        } else {
            const summary = executionResult?.gapSummary;
            if (!summary) {
                return {
                    total: comparisonResult.totalItems,
                    aOnly: 150,
                    bOnly: 100,
                    diff: comparisonResult.withDiff,
                };
            }
            return {
                total: summary.matchedCount + summary.aOnlyCount + summary.bOnlyCount,
                aOnly: summary.aOnlyCount,
                bOnly: summary.bOnlyCount,
                diff: summary.diffCount,
            };
        }
    }, [mode, executionResult, integrityResult, comparisonResult]);
    
    // Excel 다운로드 함수
    const handleExcelDownload = async (type: 'full' | 'issues' | 'diff') => {
        setIsExporting(true);
        
        try {
            const wb = XLSX.utils.book_new();
            const now = new Date().toISOString().split('T')[0];
            
            if (mode === 'integrity') {
                const data = executionResult?.integrityData || [];
                
                // 요약 시트
                const summaryData = [
                    ['무결성 검증 리포트', '', '', ''],
                    ['생성일', now, '', ''],
                    ['', '', '', ''],
                    ['구분', '건수', '비율', ''],
                    ['총 검증 건수', stats.total, '100%', ''],
                    ['Critical', stats.critical, `${((stats.critical / stats.total) * 100).toFixed(1)}%`, ''],
                    ['Warning', stats.warning, `${((stats.warning / stats.total) * 100).toFixed(1)}%`, ''],
                    ['Normal', stats.normal, `${((stats.normal / stats.total) * 100).toFixed(1)}%`, ''],
                ];
                const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, summarySheet, '요약');
                
                // 상세 데이터 시트
                if (data.length > 0) {
                    const filteredData = type === 'issues' 
                        ? data.filter(d => d.status !== 'normal')
                        : data;
                    
                    const detailData = filteredData.map(row => ({
                        'ID': row.id,
                        '차량번호': row.vehicleId,
                        '기사ID': row.driverId,
                        '운임금액': row.fareAmount,
                        '카드금액': row.cardAmount,
                        '차이': row.cardAmount - row.fareAmount,
                        '상태': row.status === 'critical' ? 'Critical' : row.status === 'warning' ? 'Warning' : 'Normal',
                        '이슈유형': row.issueType || '',
                        '이슈원인': row.issueReason || '',
                    }));
                    
                    const detailSheet = XLSX.utils.json_to_sheet(detailData);
                    XLSX.utils.book_append_sheet(wb, detailSheet, type === 'issues' ? '이슈 상세' : '전체 상세');
                }
                
                XLSX.writeFile(wb, `무결성검증_${type === 'issues' ? '이슈만' : '전체'}_${now}.xlsx`);
            } else {
                const data = executionResult?.diffData || [];
                const summary = executionResult?.gapSummary;
                
                // 요약 시트
                const summaryData = [
                    ['비교 분석 리포트', '', '', ''],
                    ['생성일', now, '', ''],
                    ['', '', '', ''],
                    ['구분', '건수', '금액', ''],
                    ['총 비교 건수', stats.total, '', ''],
                    ['A에만 존재', stats.aOnly, summary ? `${summary.aOnlyAmount.toLocaleString()}원` : '', ''],
                    ['B에만 존재', stats.bOnly, summary ? `${summary.bOnlyAmount.toLocaleString()}원` : '', ''],
                    ['금액 차이', stats.diff, summary ? `${summary.totalDiffAmount.toLocaleString()}원` : '', ''],
                ];
                const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, summarySheet, '요약');
                
                // 상세 데이터 시트
                if (data.length > 0) {
                    const filteredData = type === 'diff'
                        ? data.filter(d => d.source !== 'intersection' || d.diffAmount !== 0)
                        : data;
                    
                    const detailData = filteredData.map(row => ({
                        'ID': row.id,
                        'Key ID': row.keyId,
                        '거래일자': row.transactionDate,
                        '파일A 금액': row.fileAValue || '',
                        '파일B 금액': row.fileBValue || '',
                        '차이': row.diffAmount,
                        '구분': row.source === 'a_only' ? 'A에만 존재' : row.source === 'b_only' ? 'B에만 존재' : '매칭',
                        'AI 추론': row.aiReasoning || '',
                    }));
                    
                    const detailSheet = XLSX.utils.json_to_sheet(detailData);
                    XLSX.utils.book_append_sheet(wb, detailSheet, type === 'diff' ? '차이분만' : '전체 상세');
                }
                
                XLSX.writeFile(wb, `비교분석_${type === 'diff' ? '차이분만' : '전체'}_${now}.xlsx`);
            }
        } catch (error) {
            console.error('Excel 내보내기 오류:', error);
            alert('Excel 파일 생성 중 오류가 발생했습니다.');
        } finally {
            setIsExporting(false);
        }
    };

    const hasRealData = mode === 'integrity' 
        ? (executionResult?.integrityData?.length || 0) > 0
        : (executionResult?.diffData?.length || 0) > 0;

    if (mode === 'integrity') {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-1 shadow-xl shadow-blue-200/50">
                    <div className="bg-white rounded-3xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Shield className="w-7 h-7 text-blue-600" />
                            무결성 검증 리포트
                            {hasRealData && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">
                                    실제 데이터
                                </span>
                            )}
                        </h2>

                        <div className="p-6 bg-green-50 rounded-2xl border border-green-200 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <div>
                                    <h3 className="text-xl font-bold text-green-800">검증 완료</h3>
                                    <p className="text-green-700">
                                        총 {stats.total.toLocaleString()}건 중 {(stats.critical + stats.warning).toLocaleString()}건 이상 탐지 
                                        ({(((stats.critical + stats.warning) / stats.total) * 100).toFixed(1)}%)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <h3 className="font-bold text-gray-900">리포트 요약</h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">총 검증 건수</div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.critical.toLocaleString()}</div>
                                    <div className="text-sm text-red-700">Critical</div>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{stats.warning.toLocaleString()}</div>
                                    <div className="text-sm text-yellow-700">Warning</div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.normal.toLocaleString()}</div>
                                    <div className="text-sm text-green-700">Normal</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-900">내보내기 옵션</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleExcelDownload('full')}
                                    disabled={isExporting}
                                    className="flex items-center justify-center gap-3 p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all disabled:opacity-50"
                                >
                                    {isExporting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <FileSpreadsheet className="w-5 h-5" />
                                    )}
                                    <span className="font-medium">전체 Excel 다운로드</span>
                                </button>
                                <button 
                                    onClick={() => handleExcelDownload('issues')}
                                    disabled={isExporting}
                                    className="flex items-center justify-center gap-3 p-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all disabled:opacity-50"
                                >
                                    {isExporting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Download className="w-5 h-5" />
                                    )}
                                    <span className="font-medium">이슈만 Excel</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2">다음 권장 액션</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Critical 이슈 {stats.critical}건에 대한 개별 확인 필요</li>
                                <li>• 반복 발생 패턴 확인 및 시스템 점검 권장</li>
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
                        {hasRealData && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">
                                실제 데이터
                            </span>
                        )}
                    </h2>

                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-8 h-8 text-purple-500" />
                            <div>
                                <h3 className="text-xl font-bold text-purple-800">분석 완료</h3>
                                <p className="text-purple-700">
                                    총 {stats.total.toLocaleString()}건 비교 완료, 차이 발견 {(stats.aOnly + stats.bOnly + stats.diff).toLocaleString()}건
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <h3 className="font-bold text-gray-900">분석 요약</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
                                <div className="text-sm text-gray-600">총 비교 건수</div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.aOnly.toLocaleString()}</div>
                                <div className="text-sm text-blue-700">A에만 존재</div>
                            </div>
                            <div className="p-4 bg-pink-50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-pink-600">{stats.bOnly.toLocaleString()}</div>
                                <div className="text-sm text-pink-700">B에만 존재</div>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-yellow-600">{stats.diff.toLocaleString()}</div>
                                <div className="text-sm text-yellow-700">금액 차이</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <h3 className="font-bold text-gray-900">내보내기 옵션</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => handleExcelDownload('full')}
                                disabled={isExporting}
                                className="flex items-center justify-center gap-3 p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FileSpreadsheet className="w-5 h-5" />
                                )}
                                <span className="font-medium">전체 결과 Excel</span>
                            </button>
                            <button 
                                onClick={() => handleExcelDownload('diff')}
                                disabled={isExporting}
                                className="flex items-center justify-center gap-3 p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl transition-all disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Download className="w-5 h-5" />
                                )}
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
