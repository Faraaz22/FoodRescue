/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_PUSHER_KEY: process.env.PUSHER_KEY,
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
