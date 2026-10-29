export type Place = { name: string; nx: number; ny: number };

// 위치를 아직 모르거나 권한이 없을 때 쓰는 기본 동네
export const DEFAULT_PLACE: Place = { name: '서울 중구', nx: 60, ny: 127 };

export const PLACE_COOKIE = 'place';

// 기상청 단기예보 격자(5km, 람베르트 정각원추도법) 공식 변환식. 상수는 기상청 API 활용가이드 값이다.
const RE = 6371.00877 / 5;
const SLAT1 = (30 * Math.PI) / 180;
const SLAT2 = (60 * Math.PI) / 180;
const OLON = (126 * Math.PI) / 180;
const OLAT = (38 * Math.PI) / 180;
const XO = 43;
const YO = 136;

const tanHalf = (lat: number) => Math.tan(Math.PI / 4 + lat / 2);
const SN =
  Math.log(Math.cos(SLAT1) / Math.cos(SLAT2)) /
  Math.log(tanHalf(SLAT2) / tanHalf(SLAT1));
const SF = (tanHalf(SLAT1) ** SN * Math.cos(SLAT1)) / SN;
const RO = (RE * SF) / tanHalf(OLAT) ** SN;

export function latLonToGrid(lat: number, lon: number) {
  const ra = (RE * SF) / tanHalf((lat * Math.PI) / 180) ** SN;
  let theta = (lon * Math.PI) / 180 - OLON;
  if (theta > Math.PI) theta -= 2 * Math.PI;
  if (theta < -Math.PI) theta += 2 * Math.PI;
  theta *= SN;
  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(RO - ra * Math.cos(theta) + YO + 0.5),
  };
}

// 기상청 격자가 덮는 범위(대략 한반도 주변)인지
export const isInKorea = (lat: number, lon: number) =>
  lat >= 33 && lat <= 39 && lon >= 124 && lon <= 132;

const isGridNumber = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) > 0 && Number(value) < 300;

export function parsePlace(value: string | undefined): Place | null {
  if (!value) return null;
  try {
    const { name, nx, ny }: Partial<Record<keyof Place, unknown>> =
      JSON.parse(value);
    if (typeof name !== 'string' || !isGridNumber(nx) || !isGridNumber(ny)) {
      return null;
    }
    return { name: name.slice(0, 30), nx, ny };
  } catch {
    return null;
  }
}
