/**
 * Market card type definitions
 */

export interface MarketCategory {
  label: string;
  href: string;
}

export interface MarketOption {
  label: string;
  probability: number;
  href: string;
}

export interface NewsItem {
  source: string;
  sourceDomain: string;
  timeAgo: string;
  headline: string;
  href: string;
}

export interface Comment {
  username: string;
  text: string;
  avatarUrl?: string;
  avatarGradient?: { base: string; stops: string[] };
  href: string;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  currentValue: number;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

interface BaseMarket {
  id: string;
  type: "group" | "matchup" | "crypto";
  title: string;
  href: string;
  categories: MarketCategory[];
  volume: string;
  iconUrl?: string;
  iconBg?: string;
}

export interface GroupMarket extends BaseMarket {
  type: "group";
  options: MarketOption[];
  news: NewsItem[];
  chartSeries: ChartSeries[];
  chartData: ChartDataPoint[];
  endDate?: string;
  resolutionType?: string;
}

export interface MatchupMarket extends BaseMarket {
  type: "matchup";
  team1: {
    name: string;
    logoUrl?: string;
    color: string;
    probability: number;
    href: string;
  };
  team2: {
    name: string;
    logoUrl?: string;
    color: string;
    probability: number;
    href: string;
  };
  score?: { team1: number; team2: number };
  isLive?: boolean;
  gameInfo?: string;
  comments: Comment[];
  chartData?: ChartDataPoint[];
}

export interface CryptoMarket extends BaseMarket {
  type: "crypto";
  timeRange: string;
  priceToBeat: number;
  currentPrice?: number;
  priceDelta?: number;
  upProbability?: number;
  downProbability?: number;
  upHref: string;
  downHref: string;
  endsIn?: { minutes: number; seconds: number };
  isLive?: boolean;
  comments: Comment[];
  chartData?: { time: string; price: number; baseline: number }[];
}

export type Market = GroupMarket | MatchupMarket | CryptoMarket;
