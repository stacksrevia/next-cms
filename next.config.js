/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
    experimental: {
        optimizeCss: false, // CSS optimizasyonunu kapat
    },
    // Font loading için timeout ayarları
    webpack: (config, { isServer }) => {
        // Eğer network sorunları varsa timeout'u artır
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            }
        }
        return config
    },
    // External domains için timeout
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    }
                ],
            },
        ]
    },
}

module.exports = nextConfig