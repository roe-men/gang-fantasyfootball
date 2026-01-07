import { StatOption } from '../types/index';

export const STAT_OPTIONS: StatOption[] = [
  {
    key: 'total_wins',
    label: 'Total Wins',
    format: (value) => value !== null ? Math.round(value).toString() : '-'
  },
  {
    key: 'total_losses',
    label: 'Total Losses',
    format: (value) => value !== null ? Math.round(value).toString() : '-'
  },
  {
    key: 'total_points',
    label: 'Total Points',
    format: (value) => value !== null ? Number(value).toFixed(0) : '-'
  },
  {
    key: 'championships',
    label: 'Championships',
    format: (value) => value !== null ? Math.round(value).toString() : '-'
  },
  {
    key: 'win_percentage',
    label: 'Win %',
    format: (value) => value !== null ? Number(value).toFixed(1) + '%' : '-'
  },
  {
    key: 'avg_points_per_season',
    label: 'Avg Points/Season',
    format: (value) => value !== null ? Number(value).toFixed(1) : '-'
  },
  {
    key: 'playoff_appearences',
    label: 'Playoff Apps',
    format: (value) => value !== null ? Math.round(value).toString() : '-'
  },
  {
    key: 'playoff_percentage',
    label: 'Playoff %',
    format: (value) => value !== null ? Number(value).toFixed(1) + '%' : '-'
  },
  {
    key: 'seasons_played',
    label: 'Seasons Played',
    format: (value) => value !== null ? Math.round(value).toString() : '-'
  }
];
