import { getEveningAlert } from '@/lib/alert';
import { SITE_URL } from '@/lib/config';
import {
  listStoredSubscriptions,
  removeStoredSubscription,
} from '@/lib/pushStore';
import { fetchForecast } from '@/lib/weather';
import webpush, { WebPushError } from 'web-push';

// Vercel 크론이 매일 저녁 8시대(vercel.json)에 부른다. ?force=1은 배포 후 수신 테스트용이다.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  webpush.setVapidDetails(
    SITE_URL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
    process.env.VAPID_PRIVATE_KEY ?? ''
  );
  const force = new URL(request.url).searchParams.get('force') === '1';
  const [forecast, stored] = await Promise.all([
    fetchForecast(new Date()),
    listStoredSubscriptions(),
  ]);

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  await Promise.all(
    stored.map(async ({ subscription, offset }) => {
      const alert = getEveningAlert(forecast, offset, force);
      if (!alert) {
        skipped += 1;
        return;
      }
      try {
        await webpush.sendNotification(subscription, JSON.stringify(alert));
        sent += 1;
      } catch (error) {
        // 404·410은 앱을 지웠거나 권한을 끈 기기라 다시 보낼 일이 없다.
        if (
          error instanceof WebPushError &&
          [404, 410].includes(error.statusCode)
        ) {
          await removeStoredSubscription(subscription.endpoint);
        } else {
          failed += 1;
          console.error('푸시 전송 실패', error);
        }
      }
    })
  );

  return Response.json({ sent, skipped, failed });
}
