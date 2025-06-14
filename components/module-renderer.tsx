import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PageModule {
    id: string
    type: string
    order: number
    content: any
    isActive: boolean
}

interface ModuleRendererProps {
    module: PageModule
}

export function ModuleRenderer({ module }: ModuleRendererProps) {
    if (!module.isActive) return null

    switch (module.type) {
        case "HERO":
            return <HeroModule content={module.content} />
        case "TEXT_IMAGE":
            return <TextImageModule content={module.content} />
        case "PARALLAX":
            return <ParallaxModule content={module.content} />
        case "GALLERY":
            return <GalleryModule content={module.content} />
        case "VIDEO":
            return <VideoModule content={module.content} />
        case "CONTACT_FORM":
            return <ContactFormModule content={module.content} />
        case "TESTIMONIALS":
            return <TestimonialsModule content={module.content} />
        default:
            return (
                <div className="container mx-auto px-4 py-8">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">
                                Bilinmeyen modül tipi: {module.type}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )
    }
}

// Hero Module
function HeroModule({ content }: { content: any }) {
    return (
        <div
            className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
        >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 text-center text-white container mx-auto px-4">
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                    {content.title || "Ana Başlık"}
                </h1>
                {content.subtitle && (
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                        {content.subtitle}
                    </p>
                )}
                {content.buttonText && (
                    <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                        {content.buttonText}
                    </Button>
                )}
            </div>
        </div>
    )
}

// Text + Image Module
function TextImageModule({ content }: { content: any }) {
    const isImageRight = content.imagePosition === "right"

    return (
        <div className="container mx-auto px-4 py-16">
            <div className={`grid md:grid-cols-2 gap-12 items-center ${isImageRight ? '' : 'md:grid-cols-2'}`}>
                <div className={isImageRight ? 'order-1' : 'order-2'}>
                    <h2 className="text-3xl font-bold mb-6">
                        {content.title || "Başlık"}
                    </h2>
                    <div className="prose prose-lg max-w-none">
                        <p>{content.text || "Metin içeriği buraya gelecek..."}</p>
                    </div>
                </div>
                <div className={isImageRight ? 'order-2' : 'order-1'}>
                    {content.image ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                            <Image
                                src={content.image}
                                alt={content.title || "Resim"}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <p className="text-muted-foreground">Resim yüklenmemiş</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Parallax Module
function ParallaxModule({ content }: { content: any }) {
    return (
        <div
            className="relative py-32 bg-fixed bg-cover bg-center"
            style={{
                backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
                minHeight: content.height || '400px'
            }}
        >
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative z-10 text-center text-white container mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    {content.title || "Parallax Başlık"}
                </h2>
                {content.text && (
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        {content.text}
                    </p>
                )}
            </div>
        </div>
    )
}

// Gallery Module
function GalleryModule({ content }: { content: any }) {
    const images = content.images || []

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                    {content.title || "Galeri"}
                </h2>
                {content.description && (
                    <p className="text-muted-foreground text-lg">
                        {content.description}
                    </p>
                )}
            </div>

            {images.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">Henüz resim eklenmemiş</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((image: any, index: number) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                            <Image
                                src={image.url}
                                alt={image.alt || `Galeri resmi ${index + 1}`}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Video Module
function VideoModule({ content }: { content: any }) {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                    {content.title || "Video"}
                </h2>
                {content.description && (
                    <p className="text-muted-foreground text-lg">
                        {content.description}
                    </p>
                )}
            </div>

            <div className="max-w-4xl mx-auto">
                {content.videoUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                        <iframe
                            src={content.videoUrl}
                            title={content.title || "Video"}
                            className="w-full h-full"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Video URL'si eklenmemiş</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Contact Form Module
function ContactFormModule({ content }: { content: any }) {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">
                        {content.title || "İletişim"}
                    </h2>
                    {content.description && (
                        <p className="text-muted-foreground text-lg">
                            {content.description}
                        </p>
                    )}
                </div>

                <Card>
                    <CardContent className="p-8">
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ad Soyad</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Adınız ve soyadınız"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">E-posta</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Konu</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Mesaj konusu"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Mesaj</label>
                                <textarea
                                    rows={5}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Mesajınızı yazın..."
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Mesaj Gönder
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Testimonials Module
function TestimonialsModule({ content }: { content: any }) {
    const testimonials = content.testimonials || []

    return (
        <div className="bg-muted/30 py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        {content.title || "Müşteri Yorumları"}
                    </h2>
                    {content.description && (
                        <p className="text-muted-foreground text-lg">
                            {content.description}
                        </p>
                    )}
                </div>

                {testimonials.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">Henüz yorum eklenmemiş</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial: any, index: number) => (
                            <Card key={index}>
                                <CardContent className="p-6">
                                    <div className="mb-4">
                                        <p className="text-muted-foreground italic">
                                            "{testimonial.text}"
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {testimonial.avatar && (
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={testimonial.avatar}
                                                    alt={testimonial.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{testimonial.name}</p>
                                            {testimonial.title && (
                                                <p className="text-sm text-muted-foreground">
                                                    {testimonial.title}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 