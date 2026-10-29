import data from '../data/destinations.json';
import { hotelPickLink } from './affiliate';

export type Tier = 'budget' | 'mid' | 'high';

/** 編輯推薦飯店；sponsored 為 true 代表飯店付費（業配），前台標「廣告」 */
export interface HotelPick {
  name: string;
  tier: Tier;
  why: string;
  sponsored?: boolean;
  /** 直接貼 Trip.com / Agoda / Booking.com 的飯店頁網址，至少一個 */
  urls: { tripcom?: string; agoda?: string; booking?: string };
}

export interface Area {
  slug: string;
  name: string;
  bookingQuery: string;
  tiers: Tier[];
  goodFor: string[];
  why: string;
  watch: string;
  picks: HotelPick[];
}

export interface City {
  slug: string;
  name: string;
  tripcomCityId: number;
  agodaCityId: number;
  intro: string;
  areas: Area[];
}

export interface Country {
  slug: string;
  name: string;
  flag: string;
  cities: City[];
}

export const COUNTRIES = data.countries as Country[];

// 建置時檢查推薦飯店資料，填錯直接讓 build 失敗，避免錯誤內容上線
for (const country of COUNTRIES) {
  for (const city of country.cities) {
    for (const area of city.areas) {
      for (const pick of area.picks) {
        const where = `${city.name}・${area.name}・${pick.name || '（未命名）'}`;
        if (!pick.name?.trim()) throw new Error(`推薦飯店缺少名稱：${where}`);
        if (!pick.why?.trim()) throw new Error(`推薦飯店缺少推薦理由：${where}`);
        if (!['budget', 'mid', 'high'].includes(pick.tier)) throw new Error(`推薦飯店價位需為 budget / mid / high：${where}`);
        const urls = Object.values(pick.urls ?? {}).filter(Boolean) as string[];
        if (urls.length === 0) throw new Error(`推薦飯店至少要有一個訂房網址：${where}`);
        for (const u of urls) {
          try {
            hotelPickLink(u);
          } catch (e) {
            throw new Error(`推薦飯店網址有誤：${where}｜${(e as Error).message}`);
          }
        }
      }
    }
  }
}

export const TIER_LABEL: Record<Tier, string> = {
  budget: '平價',
  mid: '中價',
  high: '高價',
};

export function getCountry(slug: string): Country | undefined {
  return COUNTRIES.find((c) => c.slug === slug);
}

export function allCities(): { country: Country; city: City }[] {
  return COUNTRIES.flatMap((country) => country.cities.map((city) => ({ country, city })));
}

export function hotelsPath(country: Country, city: City): string {
  return `/${country.slug}/${city.slug}/hotels/`;
}

export function esimPath(country: Country): string {
  return `/esim/${country.slug}/`;
}
