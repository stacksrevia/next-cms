// Loading component for SSR

interface SSRLoadingProps {
    message?: string
}

export function SSRLoading({ message = "Yükleniyor..." }: SSRLoadingProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6">
                {/* Logo/Image */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">{message}</h2>
                    <p className="text-sm text-muted-foreground">İçerik hazırlanıyor...</p>
                </div>

                {/* Loading Bar */}
                <div className="w-64 mx-auto">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    )
} 