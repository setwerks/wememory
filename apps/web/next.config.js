/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@wememory/lib', '@wememory/types'],
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig 