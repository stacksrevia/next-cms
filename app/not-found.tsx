import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
            <div className="container mx-auto px-4">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
                            <FileQuestion className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-3xl">404 - Sayfa Bulunamadı</CardTitle>
                        <CardDescription className="text-lg">
                            Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">
                            Lütfen URL'yi kontrol edin veya anasayfaya dönün.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild>
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Anasayfa
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 