import { useMemo, useRef, useState } from 'react';
import { AxisMode, DraftPick, DraftPosition } from '../types/index';

const POSITIONS: DraftPosition[] = ['RB', 'WR', 'QB', 'TE'];

// Same position palette as the printed draft guide, so the two read as one set.
// Colour is never the only channel — each position also has its own marker
// shape, which keeps it legible for colourblind readers and in greyscale.
const POS_COLOR: Record<DraftPosition, string> = {
  RB: '#B23A26',
  WR: '#2C5698',
  QB: '#4E535C',
  TE: '#2E7C4C',
};

const W = 780;
const H = 470;
const M = { l: 54, r: 18, t: 18, b: 46 };
const PX0 = M.l;
const PX1 = W - M.r;
const PY0 = M.t;
const PY1 = H - M.b;

const Y_MIN = -250;
const Y_MAX = 210;
const REACH_LIM = 72;

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** One marker shape per position: circle RB, square WR, triangle QB, diamond TE. */
function marker(pos: DraftPosition, x: number, y: number, r: number, key: string,
                fill: string, opacity: number, stroke?: string) {
  const common = {
    key,
    fill,
    fillOpacity: opacity,
    stroke: stroke ?? 'none',
    strokeWidth: stroke ? 1.6 : 0,
  };
  switch (pos) {
    case 'RB':
      return <circle cx={x} cy={y} r={r} {...common} />;
    case 'WR':
      return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={0.8} {...common} />;
    case 'QB': {
      const h = r * 1.15;
      return <polygon points={`${x},${y - h} ${x + h},${y + h * 0.78} ${x - h},${y + h * 0.78}`} {...common} />;
    }
    case 'TE': {
      const d = r * 1.28;
      return <polygon points={`${x},${y - d} ${x + d},${y} ${x},${y + d} ${x - d},${y}`} {...common} />;
    }
  }
}

interface Props {
  data: DraftPick[];
  isLoading: boolean;
}

export function DraftScatter({ data, isLoading }: Props) {
  const [mode, setMode] = useState<AxisMode>('slot');
  const [activePos, setActivePos] = useState<DraftPosition[]>([...POSITIONS]);
  const [year, setYear] = useState<number | 'all'>('all');
  const [owner, setOwner] = useState<string | 'all'>('all');
  const [hovered, setHovered] = useState<DraftPick | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const years = useMemo(
    () => Array.from(new Set(data.map((d) => d.year))).sort((a, b) => a - b),
    [data]
  );
  const owners = useMemo(
    () => Array.from(new Set(data.map((d) => d.owner_name))).sort(),
    [data]
  );

  // Points that pass the position/year filters. Owner is a *highlight*, not a
  // filter, so you can see one manager against the league cloud.
  const shown = useMemo(
    () =>
      data.filter(
        (d) =>
          activePos.includes(d.position) &&
          (year === 'all' || d.year === year) &&
          (mode === 'slot' || d.adp_delta !== null)
      ),
    [data, activePos, year, mode]
  );

  const xOf = useMemo(() => {
    if (mode === 'slot') {
      return (d: DraftPick) => PX0 + ((d.pick_number - 1) / 191) * (PX1 - PX0);
    }
    return (d: DraftPick) => {
      const v = Math.max(-REACH_LIM, Math.min(REACH_LIM, d.adp_delta ?? 0));
      return PX0 + ((v + REACH_LIM) / (REACH_LIM * 2)) * (PX1 - PX0);
    };
  }, [mode]);

  const yOf = (d: DraftPick) =>
    PY1 - ((d.value_vs_starter - Y_MIN) / (Y_MAX - Y_MIN)) * (PY1 - PY0);

  const yZero = PY1 - ((0 - Y_MIN) / (Y_MAX - Y_MIN)) * (PY1 - PY0);

  const placed = useMemo(
    () => shown.map((d) => ({ d, x: xOf(d), y: yOf(d) })),
    [shown, xOf]
  );

  // Trend: the typical outcome at each part of the x-axis.
  const trend = useMemo(() => {
    const buckets = new Map<number, number[]>();
    for (const { d } of placed) {
      const key =
        mode === 'slot'
          ? d.round
          : Math.round(Math.max(-REACH_LIM, Math.min(REACH_LIM, d.adp_delta ?? 0)) / 15) * 15;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(d.value_vs_starter);
    }
    return Array.from(buckets.entries())
      .filter(([, v]) => v.length >= 4)
      .map(([key, v]) => {
        const cx =
          mode === 'slot'
            ? PX0 + ((key * 12 - 6 - 1) / 191) * (PX1 - PX0)
            : PX0 + ((key + REACH_LIM) / (REACH_LIM * 2)) * (PX1 - PX0);
        const val = median(v);
        return { x: cx, y: PY1 - ((val - Y_MIN) / (Y_MAX - Y_MIN)) * (PY1 - PY0) };
      })
      .sort((a, b) => a.x - b.x);
  }, [placed, mode]);

  const handleMove = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = ((clientX - rect.left) / rect.width) * W;
    const my = ((clientY - rect.top) / rect.height) * H;

    let best: DraftPick | null = null;
    let bestD = 26; // viewBox units — generous for touch
    for (const { d, x, y } of placed) {
      const dist = Math.hypot(x - mx, y - my);
      if (dist < bestD) {
        bestD = dist;
        best = d;
      }
    }
    setHovered(best);
  };

  const togglePos = (p: DraftPosition) =>
    setActivePos((cur) =>
      cur.includes(p) ? (cur.length === 1 ? cur : cur.filter((x) => x !== p)) : [...cur, p]
    );

  const xTicks =
    mode === 'slot'
      ? [1, 24, 48, 72, 96, 120, 144, 168, 192]
      : [-60, -40, -20, 0, 20, 40, 60];
  const yTicks = [-200, -100, 0, 100, 200];

  const beat = shown.filter((d) => d.value_vs_starter > 0).length;

  if (isLoading) {
    return (
      <div className="px-4 py-16 text-center text-gray-500 text-sm">Loading draft picks…</div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-gray-500 text-sm">No draft picks found.</div>
    );
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active
        ? 'bg-gray-900 text-white border-gray-900'
        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
    }`;

  return (
    <div className="px-4 py-4">
      {/* axis mode */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode('slot')} className={chip(mode === 'slot')}>
          By draft slot
        </button>
        <button onClick={() => setMode('reach')} className={chip(mode === 'reach')}>
          Reach vs. value
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {mode === 'slot' ? (
          <>
            Every drafted player, by <strong className="text-gray-900">where he was picked</strong>{' '}
            and <strong className="text-gray-900">how much he outscored the average starter</strong>{' '}
            at his position. Above the zero line beat a typical starter; the dashed line is the
            normal outcome for that round, so dots above it beat their draft cost.
          </>
        ) : (
          <>
            Did reaching work? Each pick by{' '}
            <strong className="text-gray-900">how far off ADP it was</strong> (right = reached
            early, left = fell to them) against{' '}
            <strong className="text-gray-900">what it returned</strong>.
          </>
        )}
      </p>

      {/* position + year filters */}
      <div className="flex flex-wrap gap-2 mb-2">
        {POSITIONS.map((p) => {
          const on = activePos.includes(p);
          return (
            <button
              key={p}
              onClick={() => togglePos(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                on ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-300'
              }`}
              style={on ? { backgroundColor: POS_COLOR[p] } : undefined}
            >
              <svg width="10" height="10" viewBox="-6 -6 12 12" aria-hidden="true">
                {marker(p, 0, 0, 4.4, 'k', on ? '#fff' : POS_COLOR[p], 1)}
              </svg>
              {p}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={() => setYear('all')} className={chip(year === 'all')}>
          All years
        </button>
        {years.map((y) => (
          <button key={y} onClick={() => setYear(y)} className={chip(year === y)}>
            {y}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="w-full sm:w-auto text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800"
        >
          <option value="all">Highlight a manager…</option>
          {owners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {/* chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto touch-none select-none"
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseLeave={() => setHovered(null)}
          onTouchStart={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          role="img"
          aria-label="Scatter plot of every draft pick by draft position and value returned"
        >
          {/* grid */}
          {yTicks.map((t) => {
            const y = PY1 - ((t - Y_MIN) / (Y_MAX - Y_MIN)) * (PY1 - PY0);
            return (
              <g key={`y${t}`}>
                <line x1={PX0} y1={y} x2={PX1} y2={y} stroke="#e5e7eb" strokeWidth={1} />
                <text x={PX0 - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#9ca3af">
                  {t > 0 ? `+${t}` : t}
                </text>
              </g>
            );
          })}
          {xTicks.map((t) => {
            const x =
              mode === 'slot'
                ? PX0 + ((t - 1) / 191) * (PX1 - PX0)
                : PX0 + ((t + REACH_LIM) / (REACH_LIM * 2)) * (PX1 - PX0);
            return (
              <g key={`x${t}`}>
                <line x1={x} y1={PY0} x2={x} y2={PY1} stroke="#f3f4f6" strokeWidth={1} />
                <text x={x} y={PY1 + 16} textAnchor="middle" fontSize={11} fill="#9ca3af">
                  {mode === 'reach' && t > 0 ? `+${t}` : t}
                </text>
              </g>
            );
          })}

          {/* zero line = an average starter at the position */}
          <line x1={PX0} y1={yZero} x2={PX1} y2={yZero} stroke="#9ca3af" strokeWidth={1.5} />
          <text x={PX1 - 2} y={yZero - 6} textAnchor="end" fontSize={10} fill="#6b7280">
            average starter
          </text>

          {/* dots */}
          {placed.map(({ d, x, y }) => {
            const dim = owner !== 'all' && d.owner_name !== owner;
            return marker(
              d.position,
              x,
              y,
              dim ? 3 : 4.2,
              d.id,
              POS_COLOR[d.position],
              dim ? 0.13 : 0.62
            );
          })}

          {/* trend */}
          {trend.length > 1 && (
            <path
              d={`M${trend.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}`}
              fill="none"
              stroke="#374151"
              strokeWidth={2}
              strokeDasharray="5 4"
              opacity={0.6}
            />
          )}

          {/* hovered marker on top */}
          {hovered &&
            marker(
              hovered.position,
              xOf(hovered),
              yOf(hovered),
              6.4,
              'hov',
              POS_COLOR[hovered.position],
              1,
              '#fff'
            )}

          {/* axis titles */}
          {mode === 'slot' ? (
            <text x={(PX0 + PX1) / 2} y={H - 6} textAnchor="middle" fontSize={11.5} fill="#6b7280">
              Pick number (Round 1 → 16)
            </text>
          ) : (
            <>
              <text x={PX0} y={H - 6} textAnchor="start" fontSize={11.5} fill="#6b7280">
                ← fell past ADP
              </text>
              <text x={(PX0 + PX1) / 2} y={H - 6} textAnchor="middle" fontSize={11.5} fill="#6b7280">
                spots off ADP
              </text>
              <text x={PX1} y={H - 6} textAnchor="end" fontSize={11.5} fill="#6b7280">
                reached early →
              </text>
            </>
          )}
          <text
            transform={`translate(14, ${(PY0 + PY1) / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize={11.5}
            fill="#6b7280"
          >
            Points vs. average starter
          </text>
        </svg>

        {/* tooltip */}
        {hovered && (
          <div
            className="absolute left-0 right-0 -bottom-1 sm:bottom-auto sm:top-2 sm:left-auto sm:right-2 sm:w-72 bg-white/95 backdrop-blur border border-gray-300 rounded-lg shadow-lg p-3 pointer-events-none"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-gray-900 leading-tight">{hovered.player_name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-white font-semibold mr-1.5"
                    style={{ backgroundColor: POS_COLOR[hovered.position] }}
                  >
                    {hovered.position}
                    {hovered.pos_rank ?? ''}
                  </span>
                  {hovered.nfl_team ?? ''} · {hovered.year}
                </div>
              </div>
              <div
                className="text-right font-bold text-lg leading-none whitespace-nowrap"
                style={{ color: hovered.value_vs_starter >= 0 ? '#2E7C4C' : '#B23A26' }}
              >
                {hovered.value_vs_starter > 0 ? '+' : ''}
                {Math.round(hovered.value_vs_starter)}
                <div className="text-[10px] font-medium text-gray-400 mt-1">vs. starter</div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 space-y-0.5">
              <div>
                <span className="text-gray-900 font-semibold">{hovered.owner_name}</span> · Round{' '}
                {hovered.round}, pick {hovered.pick_number}
              </div>
              <div>
                {Math.round(hovered.points)} pts · average starter scored{' '}
                {Math.round(hovered.starter_avg)}
              </div>
              {hovered.adp_delta !== null && (
                <div>
                  ADP {Math.round(hovered.adp ?? 0)} ·{' '}
                  {hovered.adp_delta > 0
                    ? `reached ${Math.round(hovered.adp_delta)} spots early`
                    : `fell ${Math.abs(Math.round(hovered.adp_delta))} spots`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-500 leading-relaxed">
        {shown.length} picks shown · {beat} ({Math.round((beat / Math.max(shown.length, 1)) * 100)}%)
        outscored an average starter
        {owner !== 'all' && <> · highlighting {owner}</>}
        {mode === 'reach' && <> · picks with no ADP on record are excluded here</>}
      </p>
      <p className="mt-1 text-xs text-gray-400 leading-relaxed">
        Tap or hover any point for the player. Kickers and defenses are excluded.
      </p>
    </div>
  );
}
