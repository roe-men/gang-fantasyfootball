import { StatOption } from '../types/index';

interface StatPickerProps {
  options: StatOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function StatPicker({ options, selectedKey, onSelect }: StatPickerProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 p-4">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onSelect(option.key)}
            className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
              selectedKey === option.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
