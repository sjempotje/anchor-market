import type { Market } from "./types";

/**
 * Sample market data for preview and testing purposes.
 */

export const sampleMarkets: Market[] = [
  {
    id: "us-iran-peace",
    type: "group",
    title: "US x Iran permanent peace deal by...?",
    href: "/event/us-x-iran-permanent-peace-deal-by",
    categories: [
      { label: "Geopolitics", href: "/geopolitics" },
      { label: "Iran", href: "/predictions/iran" },
    ],
    volume: "$52M",
    endDate: "May 31, 2026",
    iconUrl: "#",
    iconBg: "white",
    options: [
      {
        label: "April 30",
        probability: 9,
        href: "/event/us-x-iran-permanent-peace-deal-by/april-30",
      },
      {
        label: "May 31",
        probability: 35,
        href: "/event/us-x-iran-permanent-peace-deal-by/may-31",
      },
      {
        label: "June 30",
        probability: 53,
        href: "/event/us-x-iran-permanent-peace-deal-by/june-30",
      },
    ],
    chartSeries: [
      { key: "june30", label: "June 30", color: "#87bfff", currentValue: 53 },
      { key: "may31", label: "May 31", color: "#2797ff", currentValue: 35 },
      { key: "april30", label: "April 30", color: "#fdc503", currentValue: 9 },
    ],
    chartData: [
      { date: "Apr 1", june30: 0.3, may31: 0.25, april30: 0.18 },
      { date: "Apr 5", june30: 0.35, may31: 0.27, april30: 0.15 },
      { date: "Apr 10", june30: 0.4, may31: 0.3, april30: 0.13 },
      { date: "Apr 15", june30: 0.44, may31: 0.32, april30: 0.11 },
      { date: "Apr 20", june30: 0.48, may31: 0.34, april30: 0.1 },
      { date: "Apr 25", june30: 0.53, may31: 0.35, april30: 0.09 },
    ],
    news: [
      {
        source: "BBC",
        sourceDomain: "www.bbc.com",
        timeAgo: "1d ago",
        headline: "What we know about the Israel-Lebanon ceasefire",
        href: "/event/us-x-iran-permanent-peace-deal-by",
      },
      {
        source: "The New York Times",
        sourceDomain: "www.nytimes.com",
        timeAgo: "4d ago",
        headline: "Tehran and Trump Send Mixed Signals Ahead of Potential Talks",
        href: "/event/us-x-iran-permanent-peace-deal-by",
      },
      {
        source: "Reuters",
        sourceDomain: "www.reuters.com",
        timeAgo: "3d ago",
        headline: "Pakistan PM welcomes US-Iran ceasefire extension",
        href: "/event/us-x-iran-permanent-peace-deal-by",
      },
      {
        source: "WSJ",
        sourceDomain: "www.wsj.com",
        timeAgo: "5d ago",
        headline:
          "Trump Says Iran Talks Are On, Sparking Push to Bridge Gaping Divides",
        href: "/event/us-x-iran-permanent-peace-deal-by",
      },
      {
        source: "The Washington Post",
        sourceDomain: "www.washingtonpost.com",
        timeAgo: "1d ago",
        headline: "Israel and Lebanon extend ceasefire for three weeks, Trump says",
        href: "/event/us-x-iran-permanent-peace-deal-by",
      },
    ],
  },
  {
    id: "t1-vs-brion",
    type: "matchup",
    title: "T1 vs. HANJIN BRION",
    href: "/event/lol-t1-bro2-2026-04-25",
    categories: [
      { label: "Sports", href: "/sports/live" },
      { label: "Esports", href: "/esports/live" },
      { label: "League of Legends", href: "/esports/league-of-legends/games" },
    ],
    volume: "$1M",
    isLive: true,
    gameInfo: "Game 2 • Best of 3",
    score: { team1: 1, team2: 0 },
    team1: {
      name: "T1",
      color: "#e00020",
      probability: 0.96,
      href: "/event/lol-t1-bro2-2026-04-25?outcomeIndex=0",
      logoUrl: ""
    },
    team2: {
      name: "HANJIN BRION",
      color: "#00582c",
      probability: 0.04,
      href: "/event/lol-t1-bro2-2026-04-25?outcomeIndex=1",
      logoUrl: ""
    },
    chartData: [
      { date: "Pre", team1: 0.7, team2: 0.3 },
      { date: "G1 start", team1: 0.72, team2: 0.28 },
      { date: "G1 mid", team1: 0.8, team2: 0.2 },
      { date: "G1 end", team1: 0.88, team2: 0.12 },
      { date: "G2 start", team1: 0.91, team2: 0.09 },
      { date: "Now", team1: 0.96, team2: 0.04 },
    ],
    comments: [
      {
        username: "template",
        text: "template",
        avatarGradient: {
          base: "rgb(217, 58, 168)",
          stops: [
            "rgb(241, 130, 126)",
            "rgb(71, 98, 194)",
            "rgb(235, 143, 201)",
            "rgb(58, 194, 64)",
          ],
        },
        href: "/event/lol-t1-bro2-2026-04-25",
      },
      {
        username: "template",
        text: "template",
        avatarGradient: {
          base: "rgb(142, 88, 1)",
          stops: [
            "rgb(250, 234, 28)",
            "rgb(162, 88, 86)",
            "rgb(78, 198, 166)",
            "rgb(150, 136, 218)",
          ],
        },
        href: "/event/lol-t1-bro2-2026-04-25",
      },
      {
        username: "template",
        text: "template",
        avatarGradient: {
          base: "rgb(233, 80, 167)",
          stops: [
            "rgb(57, 80, 117)",
            "rgb(110, 111, 177)",
            "rgb(96, 62, 230)",
            "rgb(246, 59, 140)",
          ],
        },
        href: "/event/lol-t1-bro2-2026-04-25",
      },
      {
        username: "template",
        text: "template",
        avatarGradient: {
          base: "rgb(173, 8, 160)",
          stops: [
            "rgb(95, 11, 99)",
            "rgb(83, 182, 181)",
            "rgb(21, 119, 104)",
            "rgb(168, 83, 233)",
          ],
        },
        href: "/event/lol-t1-bro2-2026-04-25",
      },
    ],
  },
  {
    id: "btc-updown",
    type: "crypto",
    title: "Bitcoin Up or Down",
    href: "/event/btc-updown-5m",
    categories: [],
    volume: "$27M",
    timeRange: "April 25, 5:45AM–5:50AM ET",
    priceToBeat: 77751,
    currentPrice: 94250,
    priceDelta: -120,
    upProbability: 62,
    downProbability: 38,
    upHref: "/event/btc-updown-5m?outcomeIndex=0",
    downHref: "/event/btc-updown-5m?outcomeIndex=1",
    isLive: true,
    endsIn: { minutes: 4, seconds: 32 },
    iconUrl: "#",
    iconBg: "white",
    chartData: [
      { time: "5:45", price: 94500, baseline: 77751 },
      { time: "5:46", price: 94380, baseline: 77751 },
      { time: "5:47", price: 94200, baseline: 77751 },
      { time: "5:48", price: 94350, baseline: 77751 },
      { time: "Now", price: 94250, baseline: 77751 },
    ],
    comments: [
      {
        username: "template",
        text: "template",
        avatarGradient: {
          base: "rgb(212, 255, 175)",
          stops: [
            "rgb(250, 187, 241)",
            "rgb(22, 248, 142)",
            "rgb(189, 112, 62)",
            "rgb(113, 196, 42)",
          ],
        },
        href: "/event/btc-updown-5m",
      },
      {
        username: "template",
        text: "template",
        href: "/event/btc-updown-5m",
      },
      {
        username: "template",
        text: "template",
        href: "/event/btc-updown-5m",
      },
      {
        username: "template",
        text: "template",
        href: "/event/btc-updown-5m",
      },
    ],
  },
  {
    id: "nba-2026",
    type: "group",
    title: "2026 NBA Champion",
    href: "/event/2026-nba-champion",
    categories: [
      { label: "Sports", href: "/sports/live" },
      { label: "NBA", href: "/predictions/nba" },
    ],
    volume: "$8M",
    iconUrl: "#",
    iconBg: "white",
    options: [
      {
        label: "Oklahoma City Thunder",
        probability: 53,
        href: "/event/2026-nba-champion/oklahoma-city-thunder",
      },
      {
        label: "San Antonio Spurs",
        probability: 13,
        href: "/event/2026-nba-champion/san-antonio-spurs",
      },
      {
        label: "Boston Celtics",
        probability: 12,
        href: "/event/2026-nba-champion/boston-celtics",
      },
      {
        label: "Denver Nuggets",
        probability: 7,
        href: "/event/2026-nba-champion/denver-nuggets",
      },
    ],
    chartSeries: [
      {
        key: "okc",
        label: "Oklahoma City Thunder",
        color: "#87bfff",
        currentValue: 53,
      },
      {
        key: "spurs",
        label: "San Antonio Spurs",
        color: "#2797ff",
        currentValue: 12.8,
      },
      {
        key: "celtics",
        label: "Boston Celtics",
        color: "#fdc503",
        currentValue: 11.8,
      },
      {
        key: "nuggets",
        label: "Denver Nuggets",
        color: "#ff7f0e",
        currentValue: 7,
      },
    ],
    chartData: [
      { date: "Nov", okc: 0.2, spurs: 0.08, celtics: 0.18, nuggets: 0.1 },
      { date: "Dec", okc: 0.25, spurs: 0.09, celtics: 0.2, nuggets: 0.09 },
      { date: "Jan", okc: 0.31, spurs: 0.1, celtics: 0.17, nuggets: 0.08 },
      { date: "Feb", okc: 0.38, spurs: 0.11, celtics: 0.15, nuggets: 0.08 },
      { date: "Mar", okc: 0.45, spurs: 0.12, celtics: 0.13, nuggets: 0.07 },
      { date: "Apr", okc: 0.53, spurs: 0.128, celtics: 0.118, nuggets: 0.07 },
    ],
    news: [
      {
        source: "ESPN",
        sourceDomain: "www.espn.com",
        timeAgo: "2h ago",
        headline: "OKC Thunder clinch top seed in Western Conference",
        href: "/event/2026-nba-champion",
      },
      {
        source: "The Athletic",
        sourceDomain: "www.nytimes.com",
        timeAgo: "1d ago",
        headline: "Spurs young core continues to impress in playoff push",
        href: "/event/2026-nba-champion",
      },
      {
        source: "NBA.com",
        sourceDomain: "www.nba.com",
        timeAgo: "3d ago",
        headline: "Celtics look to repeat as Eastern Conference favorites",
        href: "/event/2026-nba-champion",
      },
    ],
  },
];
