"use client"

import { useEffect, useCallback, memo } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export const CustomModal = memo(function CustomModal({ isOpen, onClose, title, children }: CustomModalProps) {
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        }
    }, [onClose])

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }, [onClose])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleEscape)
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, handleEscape])

    if (!isOpen) return null

    const modalContent = (
        <div className="fixed inset-0 z-[10] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleBackdropClick}
            />

            {/* Modal */}
            <div className="relative bg-background border rounded-lg shadow-2xl w-[90vw] h-[90vh] flex flex-col max-w-7xl z-[1000000]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b shrink-0">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {children}
                </div>
            </div>
        </div>
    )

    // Portal kullanarak body'ye render et
    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}) 