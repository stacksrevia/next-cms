import Image from "next/image"

interface PageModule {
    id: string
    type: string
    order: number
    content: any
    isActive: boolean
}

interface ViraModuleRendererProps {
    module: PageModule
}

export function ViraModuleRenderer({ module }: ViraModuleRendererProps) {
    if (!module.isActive) return null

    switch (module.type) {
        case "HERO":
            return <ViraHeroModule content={module.content} />
        case "TEXT_IMAGE":
            return <ViraTextImageModule content={module.content} />
        case "PARALLAX":
            return <ViraParallaxModule content={module.content} />
        case "GALLERY":
            return <ViraGalleryModule content={module.content} />
        case "VIDEO":
            return <ViraVideoModule content={module.content} />
        case "CONTACT_FORM":
            return <ViraContactFormModule content={module.content} />
        case "TESTIMONIALS":
            return <ViraTestimonialsModule content={module.content} />
        default:
            return (
                <div style={{ padding: '2rem 0' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                        <div style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
                            <p style={{ color: '#6b7280', margin: 0 }}>
                                Bilinmeyen modül tipi: {module.type}
                            </p>
                        </div>
                    </div>
                </div>
            )
    }
}

// Hero Module
function ViraHeroModule({ content }: { content: any }) {
    return (
        <div
            style={{
                position: 'relative',
                minHeight: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
        >
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}></div>
            <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
                <div style={{ color: 'white' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        {content.title || "Ana Başlık"}
                    </h1>
                    {content.subtitle && (
                        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9, lineHeight: 1.4 }}>
                            {content.subtitle}
                        </p>
                    )}
                    {content.buttonText && (
                        <button style={{
                            backgroundColor: 'white',
                            color: 'black',
                            border: 'none',
                            padding: '1rem 2rem',
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            {content.buttonText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// Text + Image Module
function ViraTextImageModule({ content }: { content: any }) {
    const isImageRight = content.imagePosition === "right"

    return (
        <div style={{ padding: '4rem 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '3rem',
                    alignItems: 'center'
                }}>
                    <div style={{ order: isImageRight ? 1 : 2 }}>
                        <h2 style={{
                            fontSize: '2.25rem',
                            fontWeight: 700,
                            color: '#1f2937',
                            marginBottom: '1.5rem',
                            lineHeight: 1.2
                        }}>
                            {content.title || "Başlık"}
                        </h2>
                        <div style={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#374151' }}>
                            <p style={{ margin: 0 }}>{content.text || "Metin içeriği buraya gelecek..."}</p>
                        </div>
                    </div>
                    <div style={{ order: isImageRight ? 2 : 1 }}>
                        {content.image ? (
                            <div style={{
                                position: 'relative',
                                aspectRatio: '16/9',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}>
                                <Image
                                    src={content.image}
                                    alt={content.title || "Resim"}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        ) : (
                            <div style={{
                                aspectRatio: '16/9',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <p style={{ color: '#6b7280', margin: 0 }}>Resim yüklenmemiş</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Parallax Module
function ViraParallaxModule({ content }: { content: any }) {
    return (
        <div
            style={{
                position: 'relative',
                padding: '8rem 0',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
                minHeight: content.height || '400px'
            }}
        >
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
            <div style={{
                position: 'relative',
                zIndex: 10,
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 1rem',
                textAlign: 'center'
            }}>
                <div style={{ color: 'white' }}>
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: 700,
                        marginBottom: '1.5rem',
                        lineHeight: 1.2
                    }}>
                        {content.title || "Parallax Başlık"}
                    </h2>
                    {content.text && (
                        <p style={{
                            fontSize: '1.25rem',
                            opacity: 0.9,
                            lineHeight: 1.6,
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}>
                            {content.text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

// Gallery Module
function ViraGalleryModule({ content }: { content: any }) {
    const images = content.images || []

    return (
        <div style={{ padding: '4rem 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: '#1f2937',
                        marginBottom: '1rem'
                    }}>
                        {content.title || "Galeri"}
                    </h2>
                    {content.description && (
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6b7280',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            {content.description}
                        </p>
                    )}
                </div>

                {images.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <p style={{ color: '#6b7280' }}>Henüz resim eklenmemiş</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {images.map((image: any, index: number) => (
                            <div key={index} style={{
                                position: 'relative',
                                aspectRatio: '4/3',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}>
                                <Image
                                    src={image.url}
                                    alt={image.alt || `Galeri resmi ${index + 1}`}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// Video Module
function ViraVideoModule({ content }: { content: any }) {
    return (
        <div style={{ padding: '4rem 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: '#1f2937',
                        marginBottom: '1rem'
                    }}>
                        {content.title || "Video"}
                    </h2>
                    {content.description && (
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6b7280',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            {content.description}
                        </p>
                    )}
                </div>

                <div style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#000'
                }}>
                    {content.videoUrl ? (
                        <iframe
                            src={content.videoUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            allowFullScreen
                        />
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'white'
                        }}>
                            <p className="text-muted-foreground">Video URL&apos;si eklenmemiş</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Contact Form Module
function ViraContactFormModule({ content }: { content: any }) {
    return (
        <div style={{ padding: '4rem 0', backgroundColor: '#f9fafb' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: '#1f2937',
                        marginBottom: '1rem'
                    }}>
                        {content.title || "İletişim"}
                    </h2>
                    {content.description && (
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6b7280'
                        }}>
                            {content.description}
                        </p>
                    )}
                </div>

                <form style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            Ad Soyad
                        </label>
                        <input
                            type="text"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            E-posta
                        </label>
                        <input
                            type="email"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            Mesaj
                        </label>
                        <textarea
                            rows={5}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Gönder
                    </button>
                </form>
            </div>
        </div>
    )
}

// Testimonials Module
function ViraTestimonialsModule({ content }: { content: any }) {
    const testimonials = content.testimonials || []

    return (
        <div style={{ padding: '4rem 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: '#1f2937',
                        marginBottom: '1rem'
                    }}>
                        {content.title || "Referanslar"}
                    </h2>
                    {content.description && (
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#6b7280',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            {content.description}
                        </p>
                    )}
                </div>

                {testimonials.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <p style={{ color: '#6b7280' }}>Henüz referans eklenmemiş</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2rem'
                    }}>
                        {testimonials.map((testimonial: any, index: number) => (
                            <div key={index} style={{
                                backgroundColor: 'white',
                                padding: '2rem',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e5e7eb'
                            }}>
                                <p style={{
                                    fontSize: '1.125rem',
                                    lineHeight: 1.6,
                                    color: '#374151',
                                    marginBottom: '1.5rem',
                                    fontStyle: 'italic'
                                }}>
                                    &quot;{testimonial.text}&quot;
                                </p>
                                <div>
                                    <p style={{
                                        fontWeight: 600,
                                        color: '#1f2937',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {testimonial.name}
                                    </p>
                                    {testimonial.title && (
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: '#6b7280',
                                            margin: 0
                                        }}>
                                            {testimonial.title}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 