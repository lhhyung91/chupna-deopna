import { isGridNumber } from '@/lib/location';
import { fetchForecast } from '@/lib/weather';
import type { NextRequest } from 'next/server';

// 아이폰 앱이 쓰는 예보. 기상청 키는 서버에만 두고 웹 화면과 같은 fetchForecast 결과를 그대로 준다
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const nx = Number(params.get('nx'));
  const ny = Number(params.get('ny'));
  if (!isGridNumber(nx) || !isGridNumber(ny)) {
    return Response.json(
      { error: '격자 좌표가 올바르지 않아요' },
      { status: 400 }
    );
  }
  try {
    return Response.json(await fetchForecast(new Date(), { nx, ny }));
  } catch {
    return Response.json(
      { error: '날씨를 불러오지 못했어요' },
      { status: 502 }
    );
  }
}
