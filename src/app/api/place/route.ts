import { findPlace } from '@/lib/place';

// 아이폰 앱이 폰 위치를 동네로 바꿀 때 쓴다. 좌표가 접속 기록(URL)에 남지 않게 GET 대신 본문으로 받는다
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const { lat, lon } =
    typeof body === 'object' && body !== null
      ? (body as Partial<Record<'lat' | 'lon', unknown>>)
      : {};
  const result = await findPlace(Number(lat), Number(lon));
  return Response.json(result, { status: 'error' in result ? 400 : 200 });
}
