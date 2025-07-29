// next.config.ts
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ftp.goit.study',
        port: '',
        pathname: '/**/*',
      },
    ],
  },
  webpack(config: Configuration) {
    config.module?.rules?.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    config.module?.rules?.push({
      test: /\.(png|jpe?g|gif|webp)$/i,
      type: 'asset/resource',
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
