// 루트 src/lib/weather.ts가 Next 전용 fetch 옵션을 써서, 그 파일을 타입으로만 따라 읽는 앱에도 옵션 이름을 알려 준다
interface RequestInit {
  next?: { revalidate?: number | false; tags?: string[] };
}
