/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add your R2 public domain here (same host as R2_PUBLIC_URL)
    remotePatterns: [
      // { protocol: "https", hostname: "media.yourcollege.edu" },
    ],
  },
};
export default nextConfig;
