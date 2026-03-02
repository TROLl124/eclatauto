/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  i18n: {
    locales: ['fr'],
    defaultLocale: 'fr',
  },
};

module.exports = nextConfig;
