import esimData from '../data/esim.json';
import type { PartnerId } from './affiliate';
import { esimLink } from './affiliate';

export interface EsimPlan {
  id: string;
  provider: Extract<PartnerId, 'airalo' | 'saily'>;
  country: string;
  dataGB: number | null;
  unlimited: boolean;
  dailyHighSpeedGB: number | null;
  throttle: string | null;
  days: number;
  priceUSD: number;
  networks: string[];
  checkedAt: string;
  verified: boolean;
  affiliateUrl: string | null;
}

export const FX = esimData.fx;
export const PROVIDERS = esimData.providers as Record<
  EsimPlan['provider'],
  { name: string; urls: Record<string, string>; highlights: string[] }
>;
export const PLANS = esimData.plans as EsimPlan[];

/** 美元換算台幣，取整數（未含信用卡海外手續費） */
export function toTWD(usd: number): number {
  return Math.round(usd * FX.USD_TWD);
}

export function plansFor(country: string): EsimPlan[] {
  return PLANS.filter((p) => p.country === country);
}

export function planUrl(plan: EsimPlan): string {
  return esimLink(PROVIDERS[plan.provider].urls[plan.country], plan.affiliateUrl);
}

export function planLabel(plan: EsimPlan): string {
  return plan.unlimited ? `吃到飽 ${plan.days} 天` : `${plan.dataGB}GB / ${plan.days} 天`;
}

/** 最新查核日 */
export function lastChecked(plans: EsimPlan[]): string {
  return plans.reduce((max, p) => (p.checkedAt > max ? p.checkedAt : max), '');
}

/**
 * 依旅行天數與每日用量挑出最便宜的方案。
 * perDayGB 為 null 代表要吃到飽。
 */
export function cheapestFor(plans: EsimPlan[], days: number, perDayGB: number | null): EsimPlan | undefined {
  const needGB = perDayGB === null ? Infinity : days * perDayGB;
  return plans
    .filter((p) => p.days >= days && (p.unlimited || (p.dataGB ?? 0) >= needGB))
    .sort((a, b) => a.priceUSD - b.priceUSD)[0];
}
