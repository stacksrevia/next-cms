"use client"

import { useState, useRef, useEffect } from "react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade, EffectCube, EffectCoverflow, EffectFlip, EffectCards, EffectCreative } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import 'swiper/css/effect-cube'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-flip'
import 'swiper/css/effect-cards'
import 'swiper/css/effect-creative'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import '@/styles/vira-module-renderer.module.css'

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
        case "TEXT_IMAGE":
            return <TextImageModule content={module.content} />
        case "PARALLAX":
            return <ParallaxModule content={module.content} />
        case "SLIDER":
            return <SliderModule content={module.content} />
        case "CONTACT_FORM":
            return <ContactFormModule content={module.content} />
        case "DYNAMIC_FORM":
            return <DynamicFormModule content={module.content} />
        case "GALLERY":
            return <GalleryModule content={module.content} />
        case "COUNTER":
            return <CounterModule content={module.content} />
        case "ICONS":
            return <IconsModule content={module.content} />
        case "BLOG_LIST":
            return <BlogListModule content={module.content} />
        case "HTML_EDITOR":
            return <HtmlEditorModule content={module.content} />
        case "PRODUCT_LIST":
            return <ProductListModule content={module.content} />
        case "CATEGORY_LIST":
            return <CategoryListModule content={module.content} />
        case "CATALOG_LIST":
            return <CatalogListModule content={module.content} />
        case "FILE_LIST":
            return <FileListModule content={module.content} />
        case "PARAGRAPH":
            return <ParagraphModule content={module.content} />
        case "NEWSLETTER":
            return <NewsletterModule content={module.content} />
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

// Development Placeholder Component
function DevelopmentPlaceholder({ moduleName }: { moduleName: string }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{moduleName}</h3>
                    <p className="text-muted-foreground">
                        Bu modül hala geliştiriliyor...
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

// Text + Image Module
function TextImageModule({ content }: { content: any }) {
    const {
        title = "Başlık",
        titleType = "h1",
        text = "Metin içeriği",
        image = "",
        multipleImages = [],
        hasMultipleImages = false,
        textPosition = "left",
        uniqueId = "vira-text-img-1",
        margin = "",
        padding = "",
        backgroundColor = "",
        centerContent = false,
        isActive = true,
        isFullScreen = false,
        textAnimation = "fade-left",
        imageAnimation = "fade-right"
    } = content

    if (!isActive) return null

    const TitleTag = titleType as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

    const containerStyle: React.CSSProperties = {
        margin: margin || undefined,
        padding: padding || undefined,
        backgroundColor: backgroundColor || undefined,
    }

    const isContentRight = textPosition === "right"
    const hasImages = hasMultipleImages ? multipleImages.length > 0 : image

    return (
        <div
            className={`pageDetailContent textImg ${isFullScreen ? "full-screen" : ""}`}
            id={`page-detail-section-${uniqueId}`}
            style={containerStyle}
        >
            <div className={isFullScreen ? "container-fluid" : "container"}>
                <div className="row" id={uniqueId}>
                    <div
                        className={`${isFullScreen ? "col-12" : "col-md-6"} rexa-content ${isContentRight ? "content-left order-1" : "content-right order-2"} ${centerContent ? "justify-content-center" : ""} aos-init aos-animate`}
                        data-aos={textAnimation}
                        data-aos-duration="900"
                        data-aos-delay="100"
                    >
                        <TitleTag className="vira-icerik-tag">
                            {title}
                        </TitleTag>
                        <div
                            className="vira-description"
                            dangerouslySetInnerHTML={{ __html: text }}
                        />
                    </div>
                    {hasImages && (
                        <div
                            className={`col-md-6 rexa-gorseller ${isContentRight ? "gorsel-right order-2" : "gorsel-left order-1"} aos-init aos-animate`}
                            data-aos={imageAnimation}
                            data-aos-duration="900"
                            data-aos-delay="200"
                        >
                            <div className="rg-wrapper">
                                {hasMultipleImages && multipleImages.length > 0 ? (
                                    <ImageCarousel images={multipleImages} />
                                ) : (
                                    <div className="rgw">
                                        <img src={image} alt={title} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Parallax Module
function ParallaxModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Parallax Modülü" />
}

// Slider Module
function SliderModule({ content }: { content: any }) {
    const {
        sliderType = "horizontal",
        loop = false,
        autoplay = false,
        navigation = true,
        animatedArrows = false,
        pagination = true,
        slidesPerView = 1,
        isActive = true,
        videoDelay = 3300,
        autoplayDelay = 2500,
        speed = 1000,
        titleSize = "32px",
        paragraphSize = "14px",
        margin = "",
        height = "85vh",
        effect = "",
        slides = [],
        uniqueId = "vira-slider-1"
    } = content

    if (!isActive) return null

    const containerStyle: React.CSSProperties = {
        margin: margin || undefined,
        height: height || "85vh",
    }

    // Swiper modülleri
    const getModules = () => {
        const modules = []
        if (navigation) modules.push(Navigation)
        if (pagination) modules.push(Pagination)
        if (autoplay) modules.push(Autoplay)
        
        switch (effect) {
            case "fade":
                modules.push(EffectFade)
                break
            case "cube":
                modules.push(EffectCube)
                break
            case "coverflow":
                modules.push(EffectCoverflow)
                break
            case "flip":
                modules.push(EffectFlip)
                break
            case "cards":
                modules.push(EffectCards)
                break
            case "creative":
                modules.push(EffectCreative)
                break
        }
        
        return modules
    }

    // Swiper konfigürasyonu
    const swiperConfig = {
        modules: getModules(),
        direction: sliderType === "vertical" ? "vertical" : "horizontal",
        loop: loop,
        autoplay: autoplay ? {
            delay: autoplayDelay,
            disableOnInteraction: false,
        } : false,
        speed: speed,
        effect: effect || "slide",
        navigation: navigation ? {
            nextEl: `.swiper-button-next-${uniqueId}`,
            prevEl: `.swiper-button-prev-${uniqueId}`,
        } : false,
        pagination: pagination ? {
            el: `.swiper-pagination-${uniqueId}`,
            clickable: true,
        } : false,
        slidesPerView: effect === "fade" || effect === "cube" || effect === "flip" || effect === "cards" || effect === "creative" ? 1 : slidesPerView,
        spaceBetween: 0,
        // Efekt özel ayarları
        fadeEffect: effect === "fade" ? {
            crossFade: true
        } : undefined,
        cubeEffect: effect === "cube" ? {
            shadow: true,
            slideShadows: true,
            shadowOffset: 20,
            shadowScale: 0.94
        } : undefined,
        coverflowEffect: effect === "coverflow" ? {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true
        } : undefined,
        flipEffect: effect === "flip" ? {
            slideShadows: true,
            limitRotation: true
        } : undefined,
        cardsEffect: effect === "cards" ? {
            slideShadows: true,
            transformEl: null
        } : undefined,
        creativeEffect: effect === "creative" ? {
            prev: {
                shadow: true,
                translate: [0, 0, -400]
            },
            next: {
                translate: ["100%", 0, 0]
            }
        } : undefined
    }

    return (
        <div 
            className="pageSliderContent"
            id={`slider-${uniqueId}`}
            style={{
                ...containerStyle,
                '--title-size': titleSize,
                '--paragraph-size': paragraphSize
            } as React.CSSProperties}
        >
            <Swiper
                modules={getModules()}
                direction={sliderType === "vertical" ? "vertical" : "horizontal"}
                loop={loop}
                autoplay={autoplay ? {
                    delay: autoplayDelay,
                    disableOnInteraction: false,
                } : false}
                speed={speed}
                effect={effect || "slide"}
                navigation={navigation ? {
                    nextEl: `.swiper-button-next-${uniqueId}`,
                    prevEl: `.swiper-button-prev-${uniqueId}`,
                } : false}
                pagination={pagination ? {
                    el: `.swiper-pagination-${uniqueId}`,
                    clickable: true,
                } : false}
                slidesPerView={effect === "fade" || effect === "cube" || effect === "flip" || effect === "cards" || effect === "creative" ? 1 : slidesPerView}
                spaceBetween={0}
                watchSlidesProgress={true}
                watchOverflow={true}
                fadeEffect={effect === "fade" ? {
                    crossFade: true
                } : undefined}
                cubeEffect={effect === "cube" ? {
                    shadow: true,
                    slideShadows: true,
                    shadowOffset: 20,
                    shadowScale: 0.94
                } : undefined}
                coverflowEffect={effect === "coverflow" ? {
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true
                } : undefined}
                flipEffect={effect === "flip" ? {
                    slideShadows: true,
                    limitRotation: true
                } : undefined}
                cardsEffect={effect === "cards" ? {
                    slideShadows: true
                } : undefined}
                creativeEffect={effect === "creative" ? {
                    prev: {
                        shadow: true,
                        translate: [0, 0, -400]
                    },
                    next: {
                        translate: ["100%", 0, 0]
                    }
                } : undefined}
                className={`sliderJs ${sliderType === "vertical" ? "swiper-vertical" : "swiper-horizontal"} ${effect ? `swiper-${effect}` : ""}`}
                style={{
                    width: '100%',
                    height: height || '85vh',
                    minHeight: '500px'
                }}
            >
                {slides && slides.map((slide: any, index: number) => (
                    <SwiperSlide 
                        key={index}
                        id={`slide-items-${index + 1}`}
                        style={{
                            backgroundImage: slide.type === 'image' && slide.imageUrl ? `url("${slide.imageUrl}")` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            height: height || '85vh',
                            minHeight: '500px',
                            width: '100%'
                        }}
                    >
                        <SlideContent 
                            slide={slide} 
                            titleSize={titleSize}
                            paragraphSize={paragraphSize}
                            videoDelay={videoDelay}
                            slideIndex={index + 1}
                            uniqueId={uniqueId}
                        />
                    </SwiperSlide>
                ))}

                {/* Navigation Arrows */}
                {navigation && (
                    <>
                        <div className={`swiper-button-prev swiper-button-prev-${uniqueId} ${animatedArrows ? 'animated-arrow' : ''}`}></div>
                        <div className={`swiper-button-next swiper-button-next-${uniqueId} ${animatedArrows ? 'animated-arrow' : ''}`}></div>
                    </>
                )}

                {/* Pagination */}
                {pagination && (
                    <div className={`swiper-pagination swiper-pagination-${uniqueId}`}></div>
                )}
            </Swiper>
        </div>
    )
}

// Slide Content Component
function SlideContent({ slide, titleSize, paragraphSize, videoDelay, slideIndex, uniqueId }: { 
    slide: any, 
    titleSize: string, 
    paragraphSize: string,
    videoDelay: number,
    slideIndex: number,
    uniqueId: string
}) {
    const {
        type = "image",
        imageUrl = "",
        videoUrl = "",
        title = "",
        titleType = "h3",
        content = "",
        button1Text = "",
        button1Link = "",
        button2Text = "",
        button2Link = "",
        button3Text = "",
        button3Link = "",
        filigranColor = "#000000",
        textColor = "#ffffff",
        opacity = 0.5,
        contentPosition = "left",
        isActive = true
    } = slide

    if (!isActive) return null

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: filigranColor,
        opacity: opacity,
        zIndex: 2
    }

    const contentStyle: React.CSSProperties = {
        color: textColor,
        textAlign: contentPosition as any,
        position: 'absolute',
        zIndex: 4,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: contentPosition === 'center' ? 'center' : contentPosition === 'right' ? 'flex-end' : 'flex-start'
    }

    return (
        <>
            {/* Background Video */}
            {type === "video" && videoUrl && (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1,
                        animationDelay: `${videoDelay}ms`
                    }}
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>
            )}

            {/* Background Image */}
            {type === "image" && imageUrl && (
                <img 
                    src={imageUrl} 
                    alt={title}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1
                    }}
                />
            )}

            {/* Overlay */}
            <div style={overlayStyle}></div>

            {/* Content */}
            <div className="container" id={`sliderView-${slideIndex}`} style={contentStyle}>
                <div className="slider-contents">
                    <div>
                        {title && (
                            <h3 
                                className="vira-slider-tag"
                                style={{ 
                                    color: textColor
                                }}
                                data-aos="fade-up"
                                data-aos-duration="900"
                                data-aos-delay="100"
                            >
                                {title}
                            </h3>
                        )}
                        
                        {content && (
                            <div 
                                className="slider-description vira-description"
                                style={{ 
                                    color: textColor
                                }}
                                dangerouslySetInnerHTML={{ __html: content }}
                                data-aos="fade-up"
                                data-aos-duration="900"
                                data-aos-delay="200"
                            />
                        )}

                        {/* Buttons */}
                        {(button1Text || button2Text || button3Text) && (
                            <div 
                                className="vira-slider-buttons mt-4"
                                data-aos="fade-up"
                                data-aos-duration="900"
                                data-aos-delay="300"
                            >
                                {button1Text && (
                                    <a href={button1Link || "#"} className="btn btn-color">
                                        {button1Text}
                                    </a>
                                )}
                                
                                {button2Text && (
                                    <a href={button2Link || "#"} className="btn btn-outline">
                                        {button2Text}
                                    </a>
                                )}
                                
                                {button3Text && (
                                    <a href={button3Link || "#"} className="btn btn-ghost">
                                        {button3Text}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

// Contact Form Module
function ContactFormModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="İletişim Form Modülü" />
}

// Dynamic Form Module
function DynamicFormModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Dinamik Form Modülü" />
}

// Gallery Module
function GalleryModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Galeri Modülü" />
}

// Counter Module
function CounterModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Counter Modülü" />
}

// Icons Module
function IconsModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Icons Modülü" />
}

// Blog List Module
function BlogListModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Blog Listeleme Modülü" />
}

// HTML Editor Module
function HtmlEditorModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="HTML Editor Modülü" />
}

// Product List Module
function ProductListModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Ürün Listeleme Modülü" />
}

// Category List Module
function CategoryListModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Kategori Listeleme Modülü" />
}

// Catalog List Module
function CatalogListModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Katalog Listeleme Modülü" />
}

// File List Module
function FileListModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Dosya Listeleme Modülü" />
}

// Paragraph Module
function ParagraphModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="Paragraf Modülü" />
}

// Newsletter Module
function NewsletterModule({ content }: { content: any }) {
    return <DevelopmentPlaceholder moduleName="E-Bülten Modülü" />
}

// Carousel Component with Swiper
function ImageCarousel({ images }: { images: any[] }) {
    if (images.length === 0) return null

    return (
        <div className="vira-swiper-carousel">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet vira-bullet',
                    bulletActiveClass: 'swiper-pagination-bullet-active vira-bullet-active'
                }}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                loop={images.length > 1}
                grabCursor={true}
                className="vira-swiper"
            >
                {images.map((img, index) => (
                    <SwiperSlide key={index}>
                        <div className="swiper-slide-content">
                            <img
                                src={img.url}
                                alt={img.alt || `Resim ${index + 1}`}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}

