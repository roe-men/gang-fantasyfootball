import { OwnerStats, StatKey } from '../types/index';
import { STAT_OPTIONS } from '../lib/stats';

interface OwnerStatsTableProps {
  data: OwnerStats[];
  selectedStat: StatKey;
  isLoading: boolean;
}

export function OwnerStatsTable({ data, selectedStat, isLoading }: OwnerStatsTableProps) {
  const statOption = STAT_OPTIONS.find(opt => opt.key === selectedStat);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading stats...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">No stats available</div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[selectedStat] ?? 0;
    const bVal = b[selectedStat] ?? 0;
    return Number(bVal) - Number(aVal);
  });

  return (
    <div className="bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                {statOption?.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((owner, index) => {
              const statValue = owner[selectedStat];
              const formattedValue = statOption?.format(Number(statValue)) ?? '-';

              return (
                <tr
                  key={owner.id}
                  className={`border-b border-gray-100 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50`}
                >
                  <td className="px-4 py-3 text-sm font-semibold text-gray-600 w-12">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {owner.real_name || 'Unknown Owner'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-blue-600">
                    {formattedValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
