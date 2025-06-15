"use client"

import { useState, useRef, useEffect } from "react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
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
        case "TEXT_IMAGE":
            return <TextImageModule content={module.content} />
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

