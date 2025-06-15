'use client'

import AOS from 'aos'
import 'aos/dist/aos.css'
import { Fragment, useEffect } from 'react'

interface AOSProviderProps {
    children: React.ReactNode
}

export function AOSProvider({ children }: AOSProviderProps) {
    useEffect(() => {
        AOS.init({
            duration: 900,
            easing: 'ease-in-out',
            once: false,
            mirror: false,
            offset: 50,
            delay: 0,
            anchorPlacement: 'top-bottom',
        })
    }, [])

    return <Fragment>{children}</Fragment>
} 