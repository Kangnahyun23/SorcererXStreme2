export enum VIPTier {
  FREE = 'FREE',
  VIP = 'VIP'
}

export interface VIPFeatureLimits {
  tarotReadingsPerDay: number;
  tarotCardOptions: number[];
  tarotHistoryDays: number;
  chatMessagesPerDay: number;
  chatHistoryDays: number;
  astrologyAnalysisPerDay: number;
  astrology3DVisualization: boolean;
  fortuneReadingsPerDay: number;
  comprehensiveFortune: boolean;
  numerologyAnalysisPerDay: number;
  prioritySupport: boolean;
  earlyAccess: boolean;
  adFree: boolean;
  customThemes: boolean;
}

export interface VIPPlanInfo {
  tier: VIPTier;
  name: string;
  nameEn: string;
  price: number;
  duration: string;
  color: string;
  description: string;
  features: string[];
  icon: string;
  popular?: boolean;
}

export interface SubscriptionInfo {
  tier: VIPTier;
  limits: VIPFeatureLimits;
  usage: {
    tarotReadingsToday: number;
    chatMessagesToday: number;
    astrologyToday: number;
    fortuneToday: number;
    numerologyToday: number;
  } | null;
  expiresAt: string | null;
}

export interface FeatureAccessCheck {
  allowed: boolean;
  currentUsage?: number;
  limit?: number;
  tier: VIPTier;
}

