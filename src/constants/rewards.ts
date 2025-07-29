export interface Reward {
  name: string;
  description: string;
  superTokens: number;
  badgeName?: string;
  badgeIcon?: string;
}

export const REWARDS: Reward[] = [
  {
    name: "First Transaction",
    description: "Reward for completing first transaction",
    superTokens: 50,
    badgeName: "First Steps",
    badgeIcon: "🚀",
  },
  {
    name: "Emergency Fund Creator",
    description: "Reward for creating Emergency Fund vault",
    superTokens: 100,
    badgeName: "Emergency Fund",
    badgeIcon: "🛡️",
  },
  {
    name: "Happy Hour Hero",
    description: "Reward for sending exactly 222 CZT",
    superTokens: 0,
    badgeName: "Happy Hour Hero",
    badgeIcon: "🍺",
  },
  {
    name: "Rate Limit Tester",
    description: "Reward for hitting rate limits",
    superTokens: 25,
    badgeName: "Rate Limiter",
    badgeIcon: "⚡",
  },
  {
    name: "API Master",
    description: "Reward for complex API sequences",
    superTokens: 500,
    badgeName: "API Master",
    badgeIcon: "👑",
  },
  {
    name: "Transaction Master",
    description: "Reward for sending 100+ transactions",
    superTokens: 200,
    badgeName: "Transaction Master",
    badgeIcon: "💸",
  },
  {
    name: "Error Handler",
    description: "Reward for testing error scenarios",
    superTokens: 75,
    badgeName: "Error Handler",
    badgeIcon: "🐛",
  },
  {
    name: "Midnight Madness",
    description: "Reward for API calls during midnight hour",
    superTokens: 20,
    badgeName: "Night Owl",
    badgeIcon: "🦉",
  },
  {
    name: "Kind Words",
    description: "Reward for sending long message transactions",
    superTokens: 0,
    badgeName: "Friendly Financier",
    badgeIcon: "💬",
  },
  {
    name: "Christmas Spirit",
    description: "Reward for Christmas-themed vault creation",
    superTokens: 0,
    badgeName: "Christmas Spirit",
    badgeIcon: "❄️",
  },
  {
    name: "Squad Goal",
    description: "Reward for multi-user transactions",
    superTokens: 100,
    badgeName: "Squad Leader",
    badgeIcon: "👥",
  },
  {
    name: "Green Pledge",
    description: "Reward for environmental donations",
    superTokens: 25,
    badgeName: "Eco Warrior",
    badgeIcon: "🌱",
  },
];

export const getRewardByName = (name: string): Reward | undefined => {
  return REWARDS.find((reward) => reward.name === name);
};

export const getActiveRewards = (): Reward[] => {
  return REWARDS.filter((reward) => reward.superTokens > 0 || reward.badgeName);
};
