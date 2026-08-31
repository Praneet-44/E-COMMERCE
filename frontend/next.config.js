/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.externals.push({
      'aws4': 'commonjs aws4',
      'snappy': 'commonjs snappy',
      'kerberos': 'commonjs kerberos',
      '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
      'socks': 'commonjs socks',
      'gcp-metadata': 'commonjs gcp-metadata',
      'mongodb-client-encryption': 'commonjs mongodb-client-encryption'
    });
    return config;
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
