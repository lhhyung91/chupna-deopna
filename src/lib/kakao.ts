// 카카오 행정구역 1단계 이름을 화면용으로 줄인다(서울특별시 → 서울).
const SHORT_REGION: Record<string, string> = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원특별자치도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전북특별자치도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
};

type Region = {
  region_type?: unknown;
  region_1depth_name?: unknown;
  region_2depth_name?: unknown;
};

// 좌표 → "서울 중구" 같은 동네 이름. 키가 없거나 실패하면 null(화면엔 "현재 위치").
export async function regionName(lat: number, lon: number) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lon}&y=${lat}`,
      { headers: { Authorization: `KakaoAK ${key}` }, cache: 'no-store' }
    );
    if (!res.ok) return null;
    const { documents }: { documents?: Region[] } = await res.json();
    // 행정동(H) 기준. 법정동(B)과 시·구 이름은 같다.
    const region = documents?.find((doc) => doc.region_type === 'H');
    const first = region?.region_1depth_name;
    const second = region?.region_2depth_name;
    if (typeof first !== 'string') return null;
    const short = SHORT_REGION[first] ?? first;
    return typeof second === 'string' && second ? `${short} ${second}` : short;
  } catch {
    return null;
  }
}
