import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function ensureAdminExists() {
    try {
        // Check if any admin user exists
        const existingAdmin = await prisma.user.findFirst({
            where: {
                role: 'ADMIN'
            }
        })

        if (existingAdmin) {
            return {
                success: true,
                message: 'Admin user already exists',
                user: {
                    id: existingAdmin.id,
                    email: existingAdmin.email,
                    name: existingAdmin.name,
                    role: existingAdmin.role
                }
            }
        }

        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 12)

        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                name: 'Admin',
                password: hashedPassword,
                role: 'ADMIN'
            }
        })

        return {
            success: true,
            message: 'Default admin user created successfully',
            user: {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role
            }
        }
    } catch (error) {
        console.error('Error ensuring admin exists:', error)
        return {
            success: false,
            message: 'Failed to ensure admin user exists',
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    } finally {
        await prisma.$disconnect()
    }
} 