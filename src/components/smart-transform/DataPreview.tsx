import { Table } from 'lucide-react';

interface DataPreviewProps {
    data: any[];
}

export function DataPreview({ data }: DataPreviewProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-900/50 rounded border border-gray-800">
                <Table className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">데이터가 없습니다</p>
            </div>
        );
    }

    const headers = Object.keys(data[0]);

    return (
        <div className="overflow-x-auto border border-gray-700 rounded bg-gray-900">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="px-6 py-3 font-medium whitespace-nowrap">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                            {headers.map((header) => (
                                <td key={`${idx}-${header}`} className="px-6 py-4 whitespace-nowrap">
                                    {typeof row[header] === 'object' ? JSON.stringify(row[header]) : String(row[header])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
