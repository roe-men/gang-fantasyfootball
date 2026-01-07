import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { StatPicker } from './components/StatPicker';
import { OwnerStatsTable } from './components/OwnerStatsTable';
import { STAT_OPTIONS } from './lib/stats';
import { useOwnerStats } from './hooks/useOwnerStats';
import { StatKey } from './types/index';

function App() {
  const [selectedStat, setSelectedStat] = useState<StatKey>('total_wins');
  const { data, isLoading, error, refetch } = useOwnerStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  ⛽️🅰️🆖 League
                </h1>
                <p className="text-sm text-gray-600 mt-1">Fantasy Football Stats</p>
              </div>
              <button
                onClick={refetch}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh stats"
              >
                <RotateCw
                  size={20}
                  className={`text-gray-700 ${isLoading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          </div>
        </header>

        <div className="bg-white border-b border-gray-200">
          <StatPicker
            options={STAT_OPTIONS}
            selectedKey={selectedStat}
            onSelect={(key) => setSelectedStat(key as StatKey)}
          />
        </div>

        <main className="bg-white">
          {error && (
            <div className="px-4 py-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">
              Error loading stats: {error}
            </div>
          )}
          <OwnerStatsTable data={data} selectedStat={selectedStat} isLoading={isLoading} />
        </main>

        <footer className="bg-gray-50 border-t border-gray-200 px-4 py-4 text-center text-sm text-gray-600">
          <p>{data.length} owners • Updated live from league</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
