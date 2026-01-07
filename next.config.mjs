/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // serverActions is now stable in Next.js 16, no need for experimental flag
};
export default nextConfig;
