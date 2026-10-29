// 所有聯盟連結統一從這裡產生。
// 追蹤 ID 未設定時輸出一般連結（不帶追蹤），網站照常可用。
// 網址格式已於 2026-10-29 實測可開啟；聯盟參數名稱請在申請通過後，用後台產生的連結再核對一次。

export type PartnerId = 'tripcom' | 'agoda' | 'booking' | 'airalo' | 'saily';

export const PARTNERS: Record<PartnerId, { name: string }> = {
  tripcom: { name: 'Trip.com' },
  agoda: { name: 'Agoda' },
  booking: { name: 'Booking.com' },
  airalo: { name: 'Airalo' },
  saily: { name: 'Saily' },
};

const env = import.meta.env;

function withParams(base: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/** Trip.com 城市飯店列表（主力：cookie 30 天） */
export function tripcomHotels(cityId: number): string {
  return withParams('https://tw.trip.com/hotels/list', {
    city: cityId,
    Allianceid: env.TRIPCOM_ALLIANCE_ID,
    SID: env.TRIPCOM_SID,
  });
}

/** Agoda 城市搜尋（cookie 僅 1 天，作為比價選項） */
export function agodaHotels(cityId: number): string {
  return withParams('https://www.agoda.com/zh-tw/search', {
    city: cityId,
    cid: env.AGODA_CID,
  });
}

/** Booking.com 關鍵字搜尋，可精準到區域（例如「新宿, 東京」） */
export function bookingSearch(query: string): string {
  return withParams('https://www.booking.com/searchresults.zh-tw.html', { ss: query });
}

/**
 * 編輯推薦飯店：把貼上的飯店頁網址轉成聯盟連結。
 * 只保留能辨識飯店的參數，去掉日期、人數等會過期的參數，再加上追蹤 ID。
 */
export function hotelPickLink(raw: string): { href: string; partner: PartnerId } {
  const src = new URL(raw);
  const host = src.hostname;
  const clean = new URL(src.origin + src.pathname);

  if (host === 'trip.com' || host.endsWith('.trip.com')) {
    for (const key of ['hotelId', 'cityId']) {
      const value = src.searchParams.get(key);
      if (value) clean.searchParams.set(key, value);
    }
    return {
      href: withParams(clean.toString(), { Allianceid: env.TRIPCOM_ALLIANCE_ID, SID: env.TRIPCOM_SID }),
      partner: 'tripcom',
    };
  }
  if (host === 'agoda.com' || host.endsWith('.agoda.com')) {
    return { href: withParams(clean.toString(), { cid: env.AGODA_CID }), partner: 'agoda' };
  }
  if (host === 'booking.com' || host.endsWith('.booking.com')) {
    return { href: clean.toString(), partner: 'booking' };
  }
  throw new Error(`不支援的訂房網址（只接受 Trip.com、Agoda、Booking.com）：${raw}`);
}

/** eSIM 方案連結：聯盟後台產生的連結優先，否則用供應商官方國家頁 */
export function esimLink(providerUrl: string, affiliateUrl?: string | null): string {
  return affiliateUrl || providerUrl;
}
