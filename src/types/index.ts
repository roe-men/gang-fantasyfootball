export interface OwnerStats {
  id: string;
  real_name: string | null;
  espn_usernames: string[] | null;
  seasons_played: number | null;
  total_wins: number | null;
  total_losses: number | null;
  total_ties: number | null;
  total_points: number | null;
  championships: number | null;
  championship_years: number[] | null;
  avg_points_per_season: number | null;
  win_percentage: number | null;
  first_season: number | null;
  last_season: number | null;
  playoff_appearences: number | null;
  playoff_percentage: number | null;
}

export type StatKey =
  | 'total_wins'
  | 'total_losses'
  | 'total_points'
  | 'championships'
  | 'win_percentage'
  | 'avg_points_per_season'
  | 'playoff_appearences'
  | 'playoff_percentage'
  | 'seasons_played';

export interface StatOption {
  key: StatKey;
  label: string;
  format: (value: number | null) => string;
}

export type DraftPosition = 'QB' | 'RB' | 'WR' | 'TE';

export interface DraftPick {
  id: string;
  year: number;
  round: number;
  pick_number: number;
  owner_name: string;
  player_name: string;
  position: DraftPosition;
  nfl_team: string | null;
  points: number;
  pos_rank: number | null;
  starter_avg: number;
  value_vs_starter: number;
  adp: number | null;
  adp_delta: number | null;
}

export type AxisMode = 'slot' | 'reach';
