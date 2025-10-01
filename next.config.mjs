/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // If you need server actions, keep it as an object (not a boolean).
  experimental: {
    serverActions: {}
  }
};

export default nextConfig;
