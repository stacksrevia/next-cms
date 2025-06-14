import { NextResponse } from "next/server"
import { ensureAdminExists } from "@/lib/seed"

export async function GET() {
    try {
        const result = await ensureAdminExists()

        if (result.success) {
            return NextResponse.json({
                initialized: true,
                message: result.message,
                user: result.user || null
            })
        } else {
            return NextResponse.json({
                initialized: false,
                message: result.message,
                error: result.error
            }, { status: 500 })
        }
    } catch (error) {
        console.error("Initialization error:", error)
        return NextResponse.json({
            initialized: false,
            message: "Initialization failed",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}

export async function POST() {
    // Same as GET for convenience
    return GET()
} 