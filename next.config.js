/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Build sırasında ESLint hatalarını ignore et
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Build sırasında TypeScript hatalarını ignore et (sadece kritik olanlar için)
        ignoreBuildErrors: false,
    },
    images: {
        domains: ['localhost'],
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
}

module.exports = nextConfig 