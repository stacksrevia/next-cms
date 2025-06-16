import { Loader2 } from "lucide-react"

interface AdminLoadingProps {
    text?: string
    size?: "sm" | "md" | "lg"
}

export function AdminLoading({ text = "Yükleniyor...", size = "md" }: AdminLoadingProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    }

    const textSizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
    }

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mb-4`} />
            <p className={`${textSizeClasses[size]} text-muted-foreground`}>{text}</p>
        </div>
    )
} 