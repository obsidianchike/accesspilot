/** @type {import('next').NextConfig} */
const nextConfig = {
  // In development, proxy /api/* requests to the Express backend
  // so the frontend never has to worry about CORS during local dev
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
