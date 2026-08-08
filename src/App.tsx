import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { StatPicker } from './components/StatPicker';
import { OwnerStatsTable } from './components/OwnerStatsTable';
import { DraftScatter } from './components/DraftScatter';
import { STAT_OPTIONS } from './lib/stats';
import { useOwnerStats } from './hooks/useOwnerStats';
import { useDraftPicks } from './hooks/useDraftPicks';
import { StatKey } from './types/index';

type View = 'stats' | 'draft';

function App() {
  const [view, setView] = useState<View>('stats');
  const [selectedStat, setSelectedStat] = useState<StatKey>('total_wins');
  const { data, isLoading, error, refetch } = useOwnerStats();
  const {
    data: picks,
    isLoading: picksLoading,
    error: picksError,
    refetch: refetchPicks,
  } = useDraftPicks();

  const busy = view === 'stats' ? isLoading : picksLoading;
  const activeError = view === 'stats' ? error : picksError;

  const tab = (v: View) =>
    `flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
      view === v
        ? 'border-gray-900 text-gray-900'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

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
                onClick={view === 'stats' ? refetch : refetchPicks}
                disabled={busy}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RotateCw size={20} className={`text-gray-700 ${busy ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex border-t border-gray-200">
            <button onClick={() => setView('stats')} className={tab('stats')}>
              Owner Stats
            </button>
            <button onClick={() => setView('draft')} className={tab('draft')}>
              Draft Explorer
            </button>
          </div>
        </header>

        {view === 'stats' && (
          <div className="bg-white border-b border-gray-200">
            <StatPicker
              options={STAT_OPTIONS}
              selectedKey={selectedStat}
              onSelect={(key) => setSelectedStat(key as StatKey)}
            />
          </div>
        )}

        <main className="bg-white">
          {activeError && (
            <div className="px-4 py-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">
              Error loading data: {activeError}
            </div>
          )}
          {view === 'stats' ? (
            <OwnerStatsTable data={data} selectedStat={selectedStat} isLoading={isLoading} />
          ) : (
            <DraftScatter data={picks} isLoading={picksLoading} />
          )}
        </main>

        <footer className="bg-gray-50 border-t border-gray-200 px-4 py-4 text-center text-sm text-gray-600">
          {view === 'stats' ? (
            <p>{data.length} owners • Updated live from league</p>
          ) : (
            <p>{picks.length} drafted players • 2020–2025 boards</p>
          )}
        </footer>
      </div>
    </div>
  );
}

export default App;
