import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export async function seedAdminUser() {
    try {
        // Check if any admin user exists
        const existingAdmin = await prisma.user.findFirst({
            where: {
                role: "ADMIN"
            }
        })

        if (existingAdmin) {
            console.log("Admin user already exists")
            return { success: true, message: "Admin user already exists" }
        }

        // Create default admin user
        const hashedPassword = await bcrypt.hash("admin123", 12)

        const admin = await prisma.user.create({
            data: {
                email: "admin@example.com",
                name: "Admin User",
                password: hashedPassword,
                role: "ADMIN"
            }
        })

        console.log("Default admin user created:", {
            email: admin.email,
            name: admin.name,
            role: admin.role
        })

        return {
            success: true,
            message: "Admin user created successfully",
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        }
    } catch (error) {
        console.error("Error creating admin user:", error)
        return {
            success: false,
            message: "Failed to create admin user",
            error: error instanceof Error ? error.message : "Unknown error"
        }
    }
}

export async function ensureAdminExists() {
    try {
        // Check database connection first
        await prisma.$connect()

        // Test database with a simple query
        await prisma.$queryRaw`SELECT 1`

        // Try to seed admin user
        const result = await seedAdminUser()
        return result
    } catch (error) {
        console.error("Database connection or seeding failed:", error)

        // Check if it's a connection error
        if (error instanceof Error) {
            if (error.message.includes("Can't reach database server") ||
                error.message.includes("ECONNREFUSED") ||
                error.message.includes("P1001")) {
                return {
                    success: false,
                    message: "Veritabanı bağlantısı kurulamadı. PostgreSQL sunucusunun çalıştığından emin olun.",
                    error: "Database connection failed",
                    needsSetup: true
                }
            }

            if (error.message.includes("database") && error.message.includes("does not exist")) {
                return {
                    success: false,
                    message: "Veritabanı bulunamadı. 'cms' adında bir veritabanı oluşturun.",
                    error: "Database does not exist",
                    needsSetup: true
                }
            }
        }

        return {
            success: false,
            message: "Veritabanı hatası oluştu",
            error: error instanceof Error ? error.message : "Unknown error",
            needsSetup: true
        }
    } finally {
        try {
            await prisma.$disconnect()
        } catch {
            // Ignore disconnect errors
        }
    }
} 