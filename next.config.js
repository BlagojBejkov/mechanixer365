/** @type {import('next').NextConfig} */
const nextConfig = {
      serverExternalPackages: ['@libsql/client', '@libsql/darwin-arm64', '@libsql/linux-x64-musl', '@libsql/win32-x64-msvc'],
      typescript: { ignoreBuildErrors: true },
      images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
}
module.exports = nextConfig
