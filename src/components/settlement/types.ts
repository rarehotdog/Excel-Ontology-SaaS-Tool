import { FileSpreadsheet, Link2, Settings, Play, TrendingUp, Download } from 'lucide-react';

// 모드 타입: 무결성 검증 / 비교 분석
export type SettlementMode = 'integrity' | 'comparison';
export type StepType = 1 | 2 | 3 | 4 | 5 | 6;

// Gap 분석 필터 모드
export type GapViewMode = 'all' | 'a_only' | 'b_only' | 'diff';

// 무결성 상태 (Traffic Light)
export type IntegrityStatus = 'normal' | 'warning' | 'critical';

export const STEPS = [
    { id: 1, name: '파일/시트 선택', icon: FileSpreadsheet },
    { id: 2, name: '키 매핑', icon: Link2 },
    { id: 3, name: '룰 설정', icon: Settings },
    { id: 4, name: '대사 실행', icon: Play },
    { id: 5, name: '드릴다운', icon: TrendingUp },
    { id: 6, name: '리포트 생성', icon: Download },
] as const;

// 무결성 검증 모드용 인터페이스
export interface IntegritySource {
    id: string;
    name: string;
    file: string;
    sheets: number;
    required: boolean;
    selected: boolean;
}

export interface IntegrityResult {
    total: number;
    issues: number;
    issueRate: number;
    byType: {
        type: string;
        count: number;
        rate: number;
    }[];
}

// 비교 분석 모드용 인터페이스
export interface ComparisonResult {
    totalItems: number;
    withDiff: number;
    diffRate: number;
    totalDiff: number;
    topDiffs: {
        item: string;
        a: number;
        b: number;
        diff: number;
        rate: number;
    }[];
}

// 대용량 데이터 처리용 인터페이스
export interface IntegrityRow {
    id: string;
    vehicleId: string;
    driverId: string;
    callTime: string;
    paymentTime: string;
    timeDiff: number;
    fareAmount: number;
    cardAmount: number;
    status: IntegrityStatus;
    integrityScore: number;
    issueType?: string;
    issueReason?: string;
}

export interface DiffRow {
    id: string;
    keyId: string;
    transactionDate: string;
    fileAValue: number;
    fileBValue: number;
    diffAmount: number;
    source: 'intersection' | 'a_only' | 'b_only';
    aiReasoning?: string;
}

export interface GapSummary {
    aOnlyCount: number;
    aOnlyAmount: number;
    bOnlyCount: number;
    bOnlyAmount: number;
    matchedCount: number;
    diffCount: number;
    totalDiffAmount: number;
}

export interface ProcessingState {
    isProcessing: boolean;
    currentChunk: number;
    totalChunks: number;
    processedRows: number;
    totalRows: number;
    stage: 'loading' | 'validating' | 'analyzing' | 'complete';
}
