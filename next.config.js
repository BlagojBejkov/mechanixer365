/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['jspdf', 'jspdf-autotable', 'canvas'],
  typescript: { ignoreBuildErrors: true },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
}
module.exports = nextConfig
