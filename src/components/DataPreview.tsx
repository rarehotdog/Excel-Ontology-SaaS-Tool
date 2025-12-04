interface DataPreviewProps {
  data: any[];
}

export function DataPreview({ data }: DataPreviewProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-gray-900/30 border border-gray-800 rounded text-center text-gray-500 text-sm">
        데이터가 없습니다
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="bg-gray-900/30 border border-gray-800 rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs text-gray-400 bg-gray-900/50"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/30">
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-gray-300">
                    {typeof row[column] === 'number' 
                      ? row[column].toLocaleString() 
                      : row[column]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
        <div className="px-4 py-2 bg-gray-900/50 text-center text-xs text-gray-500">
          ... 외 {data.length - 10}개 행
        </div>
      )}
    </div>
  );
}
