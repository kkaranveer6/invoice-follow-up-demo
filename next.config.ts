import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/invoice-follow-up-demo',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
