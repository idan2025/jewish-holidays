/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // keep any experiments you actually use; serverActions was in your log
  experimental: { serverActions: true }
};

export default nextConfig;
