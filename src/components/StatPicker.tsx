import { StatOption } from '../types/index';

interface StatPickerProps {
  options: StatOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

const STAT_COLORS = [
  'from-red-500 to-orange-500',
  'from-orange-500 to-yellow-500',
  'from-yellow-500 to-lime-500',
  'from-lime-500 to-green-500',
  'from-green-500 to-emerald-500',
  'from-emerald-500 to-teal-500',
  'from-teal-500 to-cyan-500',
  'from-cyan-500 to-blue-500',
  'from-blue-500 to-purple-500',
];

export function StatPicker({ options, selectedKey, onSelect }: StatPickerProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 p-3 min-w-max">
          {options.map((option, index) => {
            const isSelected = selectedKey === option.key;
            const gradientColors = STAT_COLORS[index % STAT_COLORS.length];

            return (
              <button
                key={option.key}
                onClick={() => onSelect(option.key)}
                className={`px-4 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${gradientColors} text-white shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
