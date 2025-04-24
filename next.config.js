module.exports = {
  images: {
    domains: ['gravatar.com']
  },
  eslint: {
    // dirs: ['components', 'layouts', 'lib', 'pages']
  },
  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'interest-cohort=()'
          }
        ]
      }
    ]
  },
  transpilePackages: ['dayjs'],
  webpack: (config, { isServer }) => {
    // 添加对 .d.ts 文件的处理
    config.module.rules.push({
      test: /\.d\.ts$/,
      loader: 'ignore-loader'
    });
    return config;
  }
}
