import { FileSpreadsheet, Link2, Settings, Play, TrendingUp, Download } from 'lucide-react';

export type SettlementMode = 'merchant' | 'business';
export type StepType = 1 | 2 | 3 | 4 | 5 | 6;

export const STEPS = [
    { id: 1, name: '파일/시트 선택', icon: FileSpreadsheet },
    { id: 2, name: '키 매핑', icon: Link2 },
    { id: 3, name: '룰 설정', icon: Settings },
    { id: 4, name: '대사 실행', icon: Play },
    { id: 5, name: '드릴다운', icon: TrendingUp },
    { id: 6, name: '리포트 생성', icon: Download },
] as const;

export interface MerchantSource {
    id: string;
    name: string;
    file: string;
    sheets: number;
    required: boolean;
    selected: boolean;
}

export interface MerchantResult {
    total: number;
    issues: number;
    issueRate: number;
    byType: {
        type: string;
        count: number;
        rate: number;
    }[];
}

export interface BusinessComparison {
    totalItems: number;
    withDiff: number;
    diffRate: number;
    totalDiff: number;
    topDiffs: {
        merchant: string;
        a: number;
        b: number;
        diff: number;
        rate: number;
    }[];
}
