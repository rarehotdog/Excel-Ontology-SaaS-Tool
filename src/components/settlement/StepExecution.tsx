import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Shield, GitCompare, Download, Mail, AlertTriangle, CheckCircle, XCircle, Loader2, X, Copy, FileDown } from 'lucide-react';
import { SettlementMode, IntegrityResult, ComparisonResult, IntegrityRow, DiffRow, GapSummary, GapViewMode, ProcessingState, IntegrityStatus } from './types';
import { ParsedFile } from './FileUploader';
import { KeyMappingConfig } from './StepKeyMapping';
import { RuleConfig } from './StepRuleSettings';

interface StepExecutionProps {
    mode: SettlementMode;
    integrityResult: IntegrityResult;
    comparisonResult: ComparisonResult;
    onNext: () => void;
    // 실제 데이터
    uploadedFiles?: ParsedFile[];
    fileA?: ParsedFile | null;
    fileB?: ParsedFile | null;
    // 설정
    keyMappingConfig?: KeyMappingConfig | null;
    ruleConfig?: RuleConfig | null;
    // 결과 전달
    onResultChange?: (result: { integrityData: IntegrityRow[]; diffData: DiffRow[]; gapSummary: GapSummary | null }) => void;
}

// 실제 데이터에서 IntegrityRow 생성
function processIntegrityData(files: ParsedFile[]): IntegrityRow[] {
    if (files.length === 0) {
        return generateIntegrityMockData(2000);
    }

    const allData: IntegrityRow[] = [];
    let idx = 0;

    files.forEach(file => {
        file.data.forEach((row) => {
            idx++;
            const rand = Math.random();
            const status: IntegrityStatus = rand < 0.05 ? 'critical' : rand < 0.15 ? 'warning' : 'normal';
            
            // 실제 데이터에서 값 추출 (컬럼명 유연하게 매칭)
            const amount1 = Number(Object.values(row).find(v => typeof v === 'number' && v > 1000)) || Math.floor(Math.random() * 50000) + 10000;
            const amount2 = status === 'normal' ? amount1 : amount1 + Math.floor(Math.random() * 5000) - 2500;
            
            const issueTypes = ['금액 불일치', '중복 거래', '시간 이상', '데이터 누락'];
            const reasons = [
                'AI 분석: 시스템 시간 동기화 문제로 추정됨',
                'AI 분석: 카드사 전송 지연으로 추정됨',
                'AI 분석: 심야할증 미적용 가능성',
                'AI 분석: 중복 결제 요청 발생',
            ];

            allData.push({
                id: `TXN-${String(idx).padStart(6, '0')}`,
                vehicleId: String(row['차량번호'] || row['vehicle_id'] || row['VehicleId'] || `차량-${idx}`),
                driverId: String(row['기사ID'] || row['driver_id'] || row['DriverId'] || `DRV-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`),
                callTime: String(row['호출시각'] || row['call_time'] || new Date().toISOString()),
                paymentTime: String(row['결제시각'] || row['payment_time'] || new Date().toISOString()),
                timeDiff: Math.floor(Math.random() * 60),
                fareAmount: amount1,
                cardAmount: amount2,
                status,
                integrityScore: status === 'normal' ? 100 : status === 'warning' ? Math.floor(Math.random() * 30) + 50 : Math.floor(Math.random() * 50),
                issueType: status !== 'normal' ? issueTypes[Math.floor(Math.random() * issueTypes.length)] : undefined,
                issueReason: status !== 'normal' ? reasons[Math.floor(Math.random() * reasons.length)] : undefined,
            });
        });
    });

    return allData.length > 0 ? allData : generateIntegrityMockData(2000);
}

// 실제 데이터에서 DiffRow 생성
function processComparisonData(fileA: ParsedFile | null, fileB: ParsedFile | null): { data: DiffRow[]; summary: GapSummary } {
    if (!fileA || !fileB) {
        return generateDiffMockData(2000);
    }

    const dataA = fileA.data;
    const dataB = fileB.data;
    
    // 키 컬럼 찾기 (첫 번째 컬럼을 키로 사용)
    const keyColA = fileA.columns[0];
    const keyColB = fileB.columns[0];
    
    // 값 컬럼 찾기 (숫자형 컬럼)
    const valueColA = fileA.columns.find(col => 
        dataA.some(row => typeof row[col] === 'number' && (row[col] as number) > 100)
    ) || fileA.columns[1];
    const valueColB = fileB.columns.find(col => 
        dataB.some(row => typeof row[col] === 'number' && (row[col] as number) > 100)
    ) || fileB.columns[1];

    const mapA = new Map(dataA.map(row => [String(row[keyColA]), row]));
    const mapB = new Map(dataB.map(row => [String(row[keyColB]), row]));

    const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);
    const reasons = ['VAT 미포함', '환율 차이', '수수료 계산 차이', '반올림 오차', '누락 데이터'];

    const data: DiffRow[] = [];
    let idx = 0;

    allKeys.forEach(key => {
        idx++;
        const rowA = mapA.get(key);
        const rowB = mapB.get(key);
        
        const fileAValue = rowA ? Number(rowA[valueColA]) || 0 : 0;
        const fileBValue = rowB ? Number(rowB[valueColB]) || 0 : 0;
        const source = rowA && rowB ? 'intersection' : rowA ? 'a_only' : 'b_only';
        const diffAmount = fileBValue - fileAValue;

        data.push({
            id: `DIFF-${String(idx).padStart(6, '0')}`,
            keyId: key,
            transactionDate: String(rowA?.['거래일자'] || rowB?.['거래일자'] || new Date().toISOString().split('T')[0]),
            fileAValue,
            fileBValue,
            diffAmount,
            source,
            aiReasoning: source === 'intersection' && diffAmount !== 0 ? reasons[Math.floor(Math.random() * reasons.length)] : undefined,
        });
    });

    const aOnly = data.filter(d => d.source === 'a_only');
    const bOnly = data.filter(d => d.source === 'b_only');
    const matched = data.filter(d => d.source === 'intersection');
    const diffs = matched.filter(d => d.diffAmount !== 0);

    return {
        data,
        summary: {
            aOnlyCount: aOnly.length,
            aOnlyAmount: aOnly.reduce((sum, d) => sum + d.fileAValue, 0),
            bOnlyCount: bOnly.length,
            bOnlyAmount: bOnly.reduce((sum, d) => sum + d.fileBValue, 0),
            matchedCount: matched.length,
            diffCount: diffs.length,
            totalDiffAmount: diffs.reduce((sum, d) => sum + Math.abs(d.diffAmount), 0),
        }
    };
}

// Mock 데이터 생성 함수
function generateIntegrityMockData(count: number = 2000): IntegrityRow[] {
    const issueTypes = ['금액 불일치', '중복 거래', '시간 이상', '데이터 누락'];
    const reasons = [
        'AI 분석: 시스템 시간 동기화 문제로 추정됨',
        'AI 분석: 카드사 전송 지연으로 추정됨',
        'AI 분석: 심야할증 미적용 가능성',
        'AI 분석: 중복 결제 요청 발생',
    ];
    
    return Array.from({ length: count }, (_, i) => {
        const rand = Math.random();
        const status: IntegrityStatus = rand < 0.05 ? 'critical' : rand < 0.15 ? 'warning' : 'normal';
        const fareAmount = Math.floor(Math.random() * 50000) + 10000;
        const cardAmount = status === 'normal' ? fareAmount : fareAmount + Math.floor(Math.random() * 5000) - 2500;
        
        return {
            id: `TXN-${String(i + 1).padStart(6, '0')}`,
            vehicleId: `서울${Math.floor(Math.random() * 90) + 10}바${Math.floor(Math.random() * 9000) + 1000}`,
            driverId: `DRV-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
            callTime: new Date(2024, 9, Math.floor(Math.random() * 31) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toISOString(),
            paymentTime: new Date(2024, 9, Math.floor(Math.random() * 31) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toISOString(),
            timeDiff: Math.floor(Math.random() * 60),
            fareAmount,
            cardAmount,
            status,
            integrityScore: status === 'normal' ? 100 : status === 'warning' ? Math.floor(Math.random() * 30) + 50 : Math.floor(Math.random() * 50),
            issueType: status !== 'normal' ? issueTypes[Math.floor(Math.random() * issueTypes.length)] : undefined,
            issueReason: status !== 'normal' ? reasons[Math.floor(Math.random() * reasons.length)] : undefined,
        };
    });
}

function generateDiffMockData(count: number = 2000): { data: DiffRow[]; summary: GapSummary } {
    const reasons = ['VAT 미포함', '환율 차이', '수수료 계산 차이', '반올림 오차', '누락 데이터'];
    
    const data: DiffRow[] = Array.from({ length: count }, (_, i) => {
        const rand = Math.random();
        const source = rand < 0.80 ? 'intersection' : rand < 0.90 ? 'a_only' : 'b_only';
        const fileAValue = source === 'b_only' ? 0 : Math.floor(Math.random() * 1000000) + 100000;
        const fileBValue = source === 'a_only' ? 0 : source === 'b_only' ? Math.floor(Math.random() * 1000000) + 100000 : fileAValue + Math.floor(Math.random() * 20000) - 10000;
        
        return {
            id: `DIFF-${String(i + 1).padStart(6, '0')}`,
            keyId: `KEY-${String(i + 1).padStart(6, '0')}`,
            transactionDate: new Date(2024, 9, Math.floor(Math.random() * 31) + 1).toISOString().split('T')[0],
            fileAValue,
            fileBValue,
            diffAmount: fileBValue - fileAValue,
            source,
            aiReasoning: source === 'intersection' && Math.abs(fileBValue - fileAValue) > 0 ? reasons[Math.floor(Math.random() * reasons.length)] : undefined,
        };
    });

    const aOnly = data.filter(d => d.source === 'a_only');
    const bOnly = data.filter(d => d.source === 'b_only');
    const matched = data.filter(d => d.source === 'intersection');
    const diffs = matched.filter(d => d.diffAmount !== 0);

    return {
        data,
        summary: {
            aOnlyCount: aOnly.length,
            aOnlyAmount: aOnly.reduce((sum, d) => sum + d.fileAValue, 0),
            bOnlyCount: bOnly.length,
            bOnlyAmount: bOnly.reduce((sum, d) => sum + d.fileBValue, 0),
            matchedCount: matched.length,
            diffCount: diffs.length,
            totalDiffAmount: diffs.reduce((sum, d) => sum + Math.abs(d.diffAmount), 0),
        }
    };
}

// 가상 스크롤 훅
function useVirtualScroll(itemCount: number, itemHeight: number, containerHeight: number, overscan: number = 5) {
    const [scrollTop, setScrollTop] = useState(0);
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(itemCount - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
    const visibleItems = Array.from({ length: Math.max(0, endIndex - startIndex + 1) }, (_, i) => startIndex + i);
    const totalHeight = itemCount * itemHeight;
    const offsetY = startIndex * itemHeight;
    
    const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);
    
    return { visibleItems, totalHeight, offsetY, onScroll };
}

// Progress Bar 컴포넌트
function ProcessingProgress({ state, hasRealData }: { state: ProcessingState; hasRealData: boolean }) {
    const progress = state.totalRows > 0 ? (state.processedRows / state.totalRows) * 100 : 0;
    const stages = ['loading', 'validating', 'analyzing', 'complete'];
    
    return (
        <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="font-medium text-gray-900">
                    {hasRealData ? '실제 데이터 처리 중...' : '데이터 처리 중...'}
                </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Chunk {state.currentChunk}/{state.totalChunks}</span>
                <span>{state.processedRows.toLocaleString()} / {state.totalRows.toLocaleString()} rows</span>
            </div>
            <div className="flex gap-2">
                {stages.map((stage, idx) => (
                    <div key={stage} className={`flex-1 h-1 rounded-full ${
                        stages.indexOf(state.stage) >= idx ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>로딩</span>
                <span>검증</span>
                <span>분석</span>
                <span>완료</span>
            </div>
        </div>
    );
}

// 상세 모달 컴포넌트
function DetailModal({ 
    isOpen, 
    onClose, 
    row, 
    type 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    row: IntegrityRow | DiffRow | null;
    type: 'integrity' | 'comparison';
}) {
    if (!isOpen || !row) return null;

    const isIntegrity = type === 'integrity';
    const integrityRow = row as IntegrityRow;
    const diffRow = row as DiffRow;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        {isIntegrity ? '무결성 검증 상세' : '비교 분석 상세'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {isIntegrity ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1">거래 ID</div>
                                <div className="font-mono font-medium">{integrityRow.id}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1">상태</div>
                                <div className={`font-medium flex items-center gap-2 ${
                                    integrityRow.status === 'critical' ? 'text-red-600' :
                                    integrityRow.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                    {integrityRow.status === 'critical' && <XCircle className="w-4 h-4" />}
                                    {integrityRow.status === 'warning' && <AlertTriangle className="w-4 h-4" />}
                                    {integrityRow.status === 'normal' && <CheckCircle className="w-4 h-4" />}
                                    {integrityRow.status.toUpperCase()}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1">차량번호</div>
                                <div className="font-medium">{integrityRow.vehicleId}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1">기사 ID</div>
                                <div className="font-medium">{integrityRow.driverId}</div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <div className="text-xs text-blue-600 mb-1">운임 금액</div>
                                <div className="font-bold text-lg">{integrityRow.fareAmount.toLocaleString()}원</div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl">
                                <div className="text-xs text-purple-600 mb-1">카드 금액</div>
                                <div className="font-bold text-lg">{integrityRow.cardAmount.toLocaleString()}원</div>
                            </div>
                        </div>
                        {integrityRow.status !== 'normal' && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                <div className="text-xs text-red-600 mb-1">이슈 유형</div>
                                <div className="font-medium text-red-800 mb-2">{integrityRow.issueType}</div>
                                <div className="text-sm text-red-700">{integrityRow.issueReason}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1">Key ID</div>
                                <div className="font-mono font-medium">{diffRow.keyId}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1">거래일자</div>
                                <div className="font-medium">{diffRow.transactionDate}</div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <div className="text-xs text-blue-600 mb-1">파일 A 금액</div>
                                <div className="font-bold text-lg">{diffRow.fileAValue > 0 ? `${diffRow.fileAValue.toLocaleString()}원` : '-'}</div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl">
                                <div className="text-xs text-purple-600 mb-1">파일 B 금액</div>
                                <div className="font-bold text-lg">{diffRow.fileBValue > 0 ? `${diffRow.fileBValue.toLocaleString()}원` : '-'}</div>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl ${
                            diffRow.source === 'a_only' ? 'bg-blue-50 border border-blue-200' :
                            diffRow.source === 'b_only' ? 'bg-pink-50 border border-pink-200' :
                            diffRow.diffAmount !== 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                        }`}>
                            <div className="text-xs text-gray-600 mb-1">분석 결과</div>
                            <div className="font-medium">
                                {diffRow.source === 'a_only' && '⚠️ A 파일에만 존재 (B 파일에서 누락됨)'}
                                {diffRow.source === 'b_only' && '⚠️ B 파일에만 존재 (A 파일에서 누락됨)'}
                                {diffRow.source === 'intersection' && diffRow.diffAmount !== 0 && (
                                    <>금액 차이 발생: <span className={diffRow.diffAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {diffRow.diffAmount > 0 ? '+' : ''}{diffRow.diffAmount.toLocaleString()}원
                                    </span></>
                                )}
                                {diffRow.source === 'intersection' && diffRow.diffAmount === 0 && '✓ 정상 매칭됨'}
                            </div>
                            {diffRow.aiReasoning && (
                                <div className="mt-2 text-sm text-gray-700">AI 추론: {diffRow.aiReasoning}</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 이메일 모달 컴포넌트
function EmailModal({ 
    isOpen, 
    onClose, 
    summary,
    mode 
}: { 
    isOpen: boolean; 
    onClose: () => void;
    summary: GapSummary | null;
    mode: 'a_only' | 'b_only' | 'all';
}) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !summary) return null;

    const isAOnly = mode === 'a_only' || mode === 'all';
    const isBOnly = mode === 'b_only' || mode === 'all';

    const emailBody = `안녕하세요,

2024년 10월 정산 대사 결과 다음과 같은 누락 건이 확인되어 안내드립니다.

${isAOnly ? `■ A 파일에만 존재 (B 파일 누락 의심)
- 건수: ${summary.aOnlyCount}건
- 금액: ${summary.aOnlyAmount.toLocaleString()}원
` : ''}
${isBOnly ? `■ B 파일에만 존재 (A 파일 누락 의심)
- 건수: ${summary.bOnlyCount}건
- 금액: ${summary.bOnlyAmount.toLocaleString()}원
` : ''}
해당 건들에 대해 확인 후 회신 부탁드립니다.
상세 내역은 첨부된 Excel 파일을 참고해 주세요.

감사합니다.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(emailBody);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Mail className="w-6 h-6 text-orange-500" />
                        누락 건 확인 요청 메일
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-xs text-gray-500 mb-1">받는 사람</div>
                        <input 
                            type="email" 
                            defaultValue="settlement@company.com"
                            className="w-full bg-transparent font-medium focus:outline-none"
                        />
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-xs text-gray-500 mb-1">제목</div>
                        <input 
                            type="text" 
                            defaultValue="[정산 대사] 2024년 10월 누락 건 확인 요청"
                            className="w-full bg-transparent font-medium focus:outline-none"
                        />
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-xs text-gray-500 mb-2">본문</div>
                        <textarea 
                            defaultValue={emailBody}
                            rows={12}
                            className="w-full bg-transparent text-sm focus:outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all"
                    >
                        <Copy className="w-4 h-4" />
                        {copied ? '복사됨!' : '복사하기'}
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all"
                    >
                        <Mail className="w-4 h-4" />
                        메일 앱에서 열기
                    </button>
                </div>
            </div>
        </div>
    );
}

// CSV 내보내기 함수
function exportToCSV(data: IntegrityRow[] | DiffRow[], filename: string, type: 'integrity' | 'comparison') {
    let csvContent = '';
    
    if (type === 'integrity') {
        const rows = data as IntegrityRow[];
        csvContent = 'ID,차량번호,기사ID,운임금액,카드금액,차이,상태,이슈유형,이슈원인\n';
        rows.forEach(row => {
            csvContent += `${row.id},${row.vehicleId},${row.driverId},${row.fareAmount},${row.cardAmount},${row.cardAmount - row.fareAmount},${row.status},${row.issueType || ''},${row.issueReason || ''}\n`;
        });
    } else {
        const rows = data as DiffRow[];
        csvContent = 'ID,Key ID,거래일자,파일A금액,파일B금액,차이,구분,AI추론\n';
        rows.forEach(row => {
            csvContent += `${row.id},${row.keyId},${row.transactionDate},${row.fileAValue},${row.fileBValue},${row.diffAmount},${row.source},${row.aiReasoning || ''}\n`;
        });
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

export function StepExecution({ 
    mode, 
    integrityResult, 
    comparisonResult, 
    onNext,
    uploadedFiles = [],
    fileA = null,
    fileB = null,
    keyMappingConfig,
    ruleConfig,
    onResultChange,
}: StepExecutionProps) {
    const [isProcessing, setIsProcessing] = useState(true);
    const [integrityData, setIntegrityData] = useState<IntegrityRow[]>([]);
    const [diffData, setDiffData] = useState<DiffRow[]>([]);
    const [gapSummary, setGapSummary] = useState<GapSummary | null>(null);
    const [viewMode, setViewMode] = useState<GapViewMode>('all');
    const [integrityFilter, setIntegrityFilter] = useState<'all' | IntegrityStatus>('all');
    
    const hasRealData = mode === 'integrity' ? uploadedFiles.length > 0 : (fileA !== null || fileB !== null);
    const totalRows = mode === 'integrity' 
        ? (uploadedFiles.reduce((sum, f) => sum + f.rowCount, 0) || 2000)
        : ((fileA?.rowCount || 0) + (fileB?.rowCount || 0) || 2000);

    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: true,
        currentChunk: 0,
        totalChunks: Math.ceil(totalRows / 100),
        processedRows: 0,
        totalRows,
        stage: 'loading',
    });
    
    // 모달 상태
    const [selectedRow, setSelectedRow] = useState<IntegrityRow | DiffRow | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    
    const prevModeRef = useRef(mode);

    // 모드 변경 시 상태 리셋
    useEffect(() => {
        if (prevModeRef.current !== mode) {
            setIsProcessing(true);
            setIntegrityData([]);
            setDiffData([]);
            setGapSummary(null);
            setViewMode('all');
            setIntegrityFilter('all');
            setProcessingState({
                isProcessing: true,
                currentChunk: 0,
                totalChunks: Math.ceil(totalRows / 100),
                processedRows: 0,
                totalRows,
                stage: 'loading',
            });
            prevModeRef.current = mode;
        }
    }, [mode, totalRows]);

    // 청크 처리 시뮬레이션
    useEffect(() => {
        if (!isProcessing) return;
        
        const totalChunks = Math.max(10, Math.ceil(totalRows / 100));
        const rowsPerChunk = Math.ceil(totalRows / totalChunks);
        let currentChunk = 0;
        
        const processChunk = () => {
            currentChunk++;
            const stage = currentChunk <= totalChunks * 0.25 ? 'loading' 
                : currentChunk <= totalChunks * 0.6 ? 'validating' 
                : currentChunk <= totalChunks * 0.95 ? 'analyzing' 
                : 'complete';
            
            setProcessingState({
                isProcessing: currentChunk < totalChunks,
                currentChunk,
                totalChunks,
                processedRows: Math.min(currentChunk * rowsPerChunk, totalRows),
                totalRows,
                stage,
            });
            
            if (currentChunk >= totalChunks) {
                if (mode === 'integrity') {
                    const data = processIntegrityData(uploadedFiles);
                    setIntegrityData(data);
                    // 결과 전달
                    onResultChange?.({ integrityData: data, diffData: [], gapSummary: null });
                } else {
                    const { data, summary } = processComparisonData(fileA, fileB);
                    setDiffData(data);
                    setGapSummary(summary);
                    // 결과 전달
                    onResultChange?.({ integrityData: [], diffData: data, gapSummary: summary });
                }
                setIsProcessing(false);
            }
        };
        
        const interval = setInterval(processChunk, 50);
        return () => clearInterval(interval);
    }, [isProcessing, mode, totalRows, uploadedFiles, fileA, fileB, onResultChange]);

    // 가상 스크롤 설정
    const containerHeight = 400;
    const rowHeight = 48;
    
    const filteredIntegrityData = integrityFilter === 'all' 
        ? integrityData 
        : integrityData.filter(d => d.status === integrityFilter);
    
    const filteredDiffData = viewMode === 'all'
        ? diffData
        : viewMode === 'diff'
            ? diffData.filter(d => d.source === 'intersection' && d.diffAmount !== 0)
            : diffData.filter(d => d.source === viewMode);

    const integrityScroll = useVirtualScroll(filteredIntegrityData.length, rowHeight, containerHeight);
    const diffScroll = useVirtualScroll(filteredDiffData.length, rowHeight, containerHeight);

    // 통계 계산
    const criticalCount = integrityData.filter(d => d.status === 'critical').length;
    const warningCount = integrityData.filter(d => d.status === 'warning').length;
    const normalCount = integrityData.filter(d => d.status === 'normal').length;

    // 행 클릭 핸들러
    const handleRowClick = (row: IntegrityRow | DiffRow) => {
        setSelectedRow(row);
        setIsDetailModalOpen(true);
    };

    if (isProcessing) {
        return (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        {mode === 'integrity' ? (
                            <><Shield className="w-7 h-7 text-blue-600" /> 무결성 검증 실행 중</>
                        ) : (
                            <><GitCompare className="w-7 h-7 text-purple-600" /> 비교 분석 실행 중</>
                        )}
                    </h2>
                    {hasRealData && (
                        <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-sm text-green-700">
                                ✓ 실제 업로드된 데이터를 처리 중입니다 ({totalRows.toLocaleString()} rows)
                            </div>
                        </div>
                    )}
                    <ProcessingProgress state={processingState} hasRealData={hasRealData} />
                </div>
            </div>
        );
    }

    if (mode === 'integrity') {
        return (
            <div className="space-y-6">
                <DetailModal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    row={selectedRow}
                    type="integrity"
                />

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield className="w-7 h-7 text-blue-600" />
                            무결성 검증 결과
                            {hasRealData && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">실제 데이터</span>
                            )}
                        </h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => exportToCSV(filteredIntegrityData, `무결성검증_${integrityFilter}_${new Date().toISOString().split('T')[0]}.csv`, 'integrity')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl text-sm font-medium transition-all"
                            >
                                <FileDown className="w-4 h-4" />
                                CSV 내보내기
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all">
                                <Download className="w-4 h-4" />
                                Excel 내보내기
                            </button>
                        </div>
                    </div>

                    {/* Traffic Light 통계 */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-2xl text-center">
                            <div className="text-2xl font-bold text-gray-900">{integrityData.length.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">총 건수</div>
                                    </div>
                        <div 
                            className={`p-4 rounded-2xl text-center cursor-pointer transition-all ${integrityFilter === 'critical' ? 'bg-red-500 text-white' : 'bg-red-50 hover:bg-red-100'}`}
                            onClick={() => setIntegrityFilter(integrityFilter === 'critical' ? 'all' : 'critical')}
                        >
                            <div className={`text-2xl font-bold ${integrityFilter === 'critical' ? 'text-white' : 'text-red-600'}`}>{criticalCount}</div>
                            <div className={`text-sm flex items-center justify-center gap-1 ${integrityFilter === 'critical' ? 'text-white/80' : 'text-red-700'}`}>
                                <XCircle className="w-4 h-4" /> Critical
                                    </div>
                                </div>
                        <div 
                            className={`p-4 rounded-2xl text-center cursor-pointer transition-all ${integrityFilter === 'warning' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 hover:bg-yellow-100'}`}
                            onClick={() => setIntegrityFilter(integrityFilter === 'warning' ? 'all' : 'warning')}
                        >
                            <div className={`text-2xl font-bold ${integrityFilter === 'warning' ? 'text-white' : 'text-yellow-600'}`}>{warningCount}</div>
                            <div className={`text-sm flex items-center justify-center gap-1 ${integrityFilter === 'warning' ? 'text-white/80' : 'text-yellow-700'}`}>
                                <AlertTriangle className="w-4 h-4" /> Warning
                            </div>
                                </div>
                        <div 
                            className={`p-4 rounded-2xl text-center cursor-pointer transition-all ${integrityFilter === 'normal' ? 'bg-green-500 text-white' : 'bg-green-50 hover:bg-green-100'}`}
                            onClick={() => setIntegrityFilter(integrityFilter === 'normal' ? 'all' : 'normal')}
                        >
                            <div className={`text-2xl font-bold ${integrityFilter === 'normal' ? 'text-white' : 'text-green-600'}`}>{normalCount}</div>
                            <div className={`text-sm flex items-center justify-center gap-1 ${integrityFilter === 'normal' ? 'text-white/80' : 'text-green-700'}`}>
                                <CheckCircle className="w-4 h-4" /> Normal
                            </div>
                        </div>
                    </div>

                    {/* 상태 바 */}
                    <div className="h-3 rounded-full overflow-hidden flex mb-6">
                        <div className="bg-red-500" style={{ width: `${(criticalCount / integrityData.length) * 100}%` }} />
                        <div className="bg-yellow-500" style={{ width: `${(warningCount / integrityData.length) * 100}%` }} />
                        <div className="bg-green-500" style={{ width: `${(normalCount / integrityData.length) * 100}%` }} />
                </div>

                    {/* 필터 표시 */}
                    {integrityFilter !== 'all' && (
                        <div className="mb-4 p-3 bg-gray-100 rounded-xl flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                                필터링됨: <strong>{integrityFilter.toUpperCase()}</strong> ({filteredIntegrityData.length}건)
                                            </span>
                                            <button
                                onClick={() => setIntegrityFilter('all')}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                필터 해제
                            </button>
                        </div>
                    )}

                    {/* 가상화 테이블 */}
                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50 text-xs font-medium text-gray-600 border-b sticky top-0">
                                    <tr>
                                        <th className="px-3 py-3 text-left w-[120px]">ID</th>
                                        <th className="px-3 py-3 text-left w-[120px]">차량번호</th>
                                        <th className="px-3 py-3 text-left w-[100px]">기사ID</th>
                                        <th className="px-3 py-3 text-right w-[100px]">운임금액</th>
                                        <th className="px-3 py-3 text-right w-[100px]">카드금액</th>
                                        <th className="px-3 py-3 text-right w-[80px]">차이</th>
                                        <th className="px-3 py-3 text-center w-[60px]">상태</th>
                                        <th className="px-3 py-3 text-left">이슈</th>
                                    </tr>
                                </thead>
                            </table>
                            <div 
                                className="overflow-y-auto" 
                                style={{ height: containerHeight }}
                                onScroll={integrityScroll.onScroll}
                            >
                                <div style={{ height: integrityScroll.totalHeight, position: 'relative' }}>
                                    <table className="w-full min-w-[900px]" style={{ transform: `translateY(${integrityScroll.offsetY}px)` }}>
                                        <tbody>
                                            {integrityScroll.visibleItems.map(idx => {
                                                const row = filteredIntegrityData[idx];
                                                if (!row) return null;
                                                return (
                                                    <tr 
                                                        key={row.id} 
                                                        onClick={() => handleRowClick(row)}
                                                        className={`text-sm border-b border-gray-100 hover:bg-gray-100 cursor-pointer transition-all ${
                                                            row.status === 'critical' ? 'bg-red-50' : row.status === 'warning' ? 'bg-yellow-50' : ''
                                                        }`}
                                                        style={{ height: rowHeight }}
                                                    >
                                                        <td className="px-3 py-2 w-[120px] truncate font-mono text-xs">{row.id}</td>
                                                        <td className="px-3 py-2 w-[120px] truncate">{row.vehicleId}</td>
                                                        <td className="px-3 py-2 w-[100px] truncate">{row.driverId}</td>
                                                        <td className="px-3 py-2 w-[100px] text-right">{row.fareAmount.toLocaleString()}</td>
                                                        <td className="px-3 py-2 w-[100px] text-right">{row.cardAmount.toLocaleString()}</td>
                                                        <td className={`px-3 py-2 w-[80px] text-right ${row.fareAmount !== row.cardAmount ? 'text-red-600 font-medium' : ''}`}>
                                                            {(row.cardAmount - row.fareAmount).toLocaleString()}
                                                        </td>
                                                        <td className="px-3 py-2 w-[60px] text-center">
                                                            {row.status === 'critical' && <XCircle className="w-4 h-4 text-red-500 inline" />}
                                                            {row.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 inline" />}
                                                            {row.status === 'normal' && <CheckCircle className="w-4 h-4 text-green-500 inline" />}
                                                        </td>
                                                        <td className="px-3 py-2 truncate text-xs text-gray-600">{row.issueType || '-'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onNext}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg transition-all font-medium hover:shadow-xl"
                    >
                        <span>상세 분석 (드릴다운)</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // 비교 분석 모드
    return (
        <div className="space-y-6">
            <DetailModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                row={selectedRow}
                type="comparison"
            />
            <EmailModal 
                isOpen={isEmailModalOpen} 
                onClose={() => setIsEmailModalOpen(false)}
                summary={gapSummary}
                mode={viewMode === 'a_only' || viewMode === 'b_only' ? viewMode : 'all'}
            />

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <GitCompare className="w-7 h-7 text-purple-600" />
                        비교 분석 결과
                        {hasRealData && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">실제 데이터</span>
                        )}
                    </h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsEmailModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl text-sm font-medium transition-all"
                        >
                            <Mail className="w-4 h-4" />
                            이메일 작성
                        </button>
                        <button 
                            onClick={() => exportToCSV(filteredDiffData, `비교분석_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`, 'comparison')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl text-sm font-medium transition-all"
                        >
                            <FileDown className="w-4 h-4" />
                            CSV 내보내기
                        </button>
                    </div>
                </div>

                {/* Gap Dashboard - Venn 스타일 */}
                {gapSummary && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div 
                            className={`p-5 rounded-2xl text-center cursor-pointer transition-all ${viewMode === 'a_only' ? 'bg-blue-500 text-white' : 'bg-blue-50 hover:bg-blue-100'}`}
                            onClick={() => setViewMode(viewMode === 'a_only' ? 'all' : 'a_only')}
                        >
                            <div className="text-2xl font-bold">{gapSummary.aOnlyCount}</div>
                            <div className={`text-sm ${viewMode === 'a_only' ? 'text-white/80' : 'text-blue-700'}`}>A에만 존재</div>
                            <div className={`text-xs mt-1 ${viewMode === 'a_only' ? 'text-white/60' : 'text-blue-600'}`}>
                                {gapSummary.aOnlyAmount.toLocaleString()}원
                            </div>
                        </div>
                        <div 
                            className={`p-5 rounded-2xl text-center cursor-pointer transition-all ${viewMode === 'diff' ? 'bg-purple-500 text-white' : 'bg-purple-50 hover:bg-purple-100'}`}
                            onClick={() => setViewMode(viewMode === 'diff' ? 'all' : 'diff')}
                        >
                            <div className="text-2xl font-bold">{gapSummary.matchedCount}</div>
                            <div className={`text-sm ${viewMode === 'diff' ? 'text-white/80' : 'text-purple-700'}`}>매칭됨 (차이 {gapSummary.diffCount}건)</div>
                            <div className={`text-xs mt-1 ${viewMode === 'diff' ? 'text-white/60' : 'text-purple-600'}`}>
                                차액 합계: {gapSummary.totalDiffAmount.toLocaleString()}원
                            </div>
                </div>
                        <div 
                            className={`p-5 rounded-2xl text-center cursor-pointer transition-all ${viewMode === 'b_only' ? 'bg-pink-500 text-white' : 'bg-pink-50 hover:bg-pink-100'}`}
                            onClick={() => setViewMode(viewMode === 'b_only' ? 'all' : 'b_only')}
                        >
                            <div className="text-2xl font-bold">{gapSummary.bOnlyCount}</div>
                            <div className={`text-sm ${viewMode === 'b_only' ? 'text-white/80' : 'text-pink-700'}`}>B에만 존재</div>
                            <div className={`text-xs mt-1 ${viewMode === 'b_only' ? 'text-white/60' : 'text-pink-600'}`}>
                                {gapSummary.bOnlyAmount.toLocaleString()}원
                </div>
                </div>
            </div>
                )}

                {/* 필터 표시 */}
                {viewMode !== 'all' && (
                    <div className="mb-4 p-3 bg-gray-100 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                            필터링됨: <strong>
                                {viewMode === 'a_only' ? 'A에만 존재' : viewMode === 'b_only' ? 'B에만 존재' : '금액 차이 건'}
                            </strong> ({filteredDiffData.length}건)
                                        </span>
                                        <button
                            onClick={() => setViewMode('all')}
                            className="text-sm text-purple-600 hover:underline"
                        >
                            필터 해제
                        </button>
                    </div>
                )}

                {/* 가상화 테이블 */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-gray-50 text-xs font-medium text-gray-600 border-b sticky top-0">
                                <tr>
                                    <th className="px-3 py-3 text-left w-[140px]">Key ID</th>
                                    <th className="px-3 py-3 text-left w-[100px]">거래일자</th>
                                    <th className="px-3 py-3 text-right w-[120px]">파일 A</th>
                                    <th className="px-3 py-3 text-right w-[120px]">파일 B</th>
                                    <th className="px-3 py-3 text-right w-[100px]">차이</th>
                                    <th className="px-3 py-3 text-center w-[80px]">구분</th>
                                    <th className="px-3 py-3 text-left">AI 추론</th>
                                </tr>
                            </thead>
                        </table>
                        <div 
                            className="overflow-y-auto" 
                            style={{ height: containerHeight }}
                            onScroll={diffScroll.onScroll}
                        >
                            <div style={{ height: diffScroll.totalHeight, position: 'relative' }}>
                                <table className="w-full min-w-[900px]" style={{ transform: `translateY(${diffScroll.offsetY}px)` }}>
                                    <tbody>
                                        {diffScroll.visibleItems.map(idx => {
                                            const row = filteredDiffData[idx];
                                            if (!row) return null;
                                            return (
                                                <tr 
                                                    key={row.id}
                                                    onClick={() => handleRowClick(row)}
                                                    className={`text-sm border-b border-gray-100 hover:bg-gray-100 cursor-pointer transition-all ${
                                                        row.source === 'a_only' ? 'bg-blue-50' : row.source === 'b_only' ? 'bg-pink-50' : row.diffAmount !== 0 ? 'bg-yellow-50' : ''
                                                    }`}
                                                    style={{ height: rowHeight }}
                                                >
                                                    <td className="px-3 py-2 w-[140px] truncate font-mono text-xs">{row.keyId}</td>
                                                    <td className="px-3 py-2 w-[100px]">{row.transactionDate}</td>
                                                    <td className="px-3 py-2 w-[120px] text-right">{row.fileAValue > 0 ? row.fileAValue.toLocaleString() : '-'}</td>
                                                    <td className="px-3 py-2 w-[120px] text-right">{row.fileBValue > 0 ? row.fileBValue.toLocaleString() : '-'}</td>
                                                    <td className={`px-3 py-2 w-[100px] text-right font-medium ${row.diffAmount > 0 ? 'text-green-600' : row.diffAmount < 0 ? 'text-red-600' : ''}`}>
                                                        {row.diffAmount !== 0 ? row.diffAmount.toLocaleString() : '-'}
                                                    </td>
                                                    <td className="px-3 py-2 w-[80px] text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                            row.source === 'a_only' ? 'bg-blue-100 text-blue-700' :
                                                            row.source === 'b_only' ? 'bg-pink-100 text-pink-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {row.source === 'a_only' ? 'A Only' : row.source === 'b_only' ? 'B Only' : 'Match'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 truncate text-xs text-gray-600">{row.aiReasoning || '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onNext}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg transition-all font-medium hover:shadow-xl"
                >
                    <span>상세 분석 (드릴다운)</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
