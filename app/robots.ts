import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/auth/login', '/auth/sign-up'],
      disallow: ['/dashboard/', '/onboarding/', '/shared/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
