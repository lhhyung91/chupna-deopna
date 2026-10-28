import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '춥나덥나',
    short_name: '춥나덥나',
    start_url: '/',
    display: 'standalone',
    background_color: '#F1EFE8',
    theme_color: '#F1EFE8',
    icons: [
      {
        src: '/icons/logo_app_192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/logo_app_512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
