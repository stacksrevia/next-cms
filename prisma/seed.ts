import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seeding...')

    try {
        // 1. Admin kullanıcısı kontrolü ve oluşturma
        console.log('👤 Checking admin users...')
        const adminCount = await prisma.user.count({
            where: { role: 'ADMIN' }
        })

        if (adminCount === 0) {
            console.log('📝 Creating default admin user...')
            const hashedPassword = await bcrypt.hash('admin123', 12)

            const adminUser = await prisma.user.create({
                data: {
                    email: 'admin@example.com',
                    password: hashedPassword,
                    name: 'Admin',
                    role: 'ADMIN'
                }
            })
            console.log(`✅ Default admin user created: ${adminUser.email} / admin123`)
        } else {
            console.log(`✅ Admin users already exist (${adminCount} found)`)
        }

        // 2. Dil kontrolü ve oluşturma
        console.log('🌍 Checking languages...')
        const languageCount = await prisma.language.count({
            where: { isActive: true }
        })

        let turkishLanguage
        if (languageCount === 0) {
            console.log('📝 Creating default Turkish language...')
            turkishLanguage = await prisma.language.create({
                data: {
                    code: 'tr',
                    name: 'Türkçe',
                    flag: 'TR',
                    isDefault: true,
                    isActive: true
                }
            })
            console.log(`✅ Default Turkish language created: ${turkishLanguage.code}`)
        } else {
            // Türkçe dil var mı kontrol et
            turkishLanguage = await prisma.language.findUnique({
                where: { code: 'tr' }
            })

            if (!turkishLanguage) {
                console.log('📝 Creating Turkish language...')
                turkishLanguage = await prisma.language.create({
                    data: {
                        code: 'tr',
                        name: 'Türkçe',
                        flag: 'TR',
                        isDefault: true,
                        isActive: true
                    }
                })
                console.log(`✅ Turkish language created: ${turkishLanguage.code}`)
            } else {
                console.log(`✅ Turkish language already exists: ${turkishLanguage.code}`)
            }
        }

        // 3. Ana sayfa kontrolü ve oluşturma
        console.log('📄 Checking pages...')
        const pageCount = await prisma.globalPage.count({
            where: { isActive: true }
        })

        if (pageCount === 0) {
            console.log('📝 Creating default home page...')

            const homePage = await prisma.globalPage.create({
                data: {
                    slug: 'anasayfa',
                    order: 0,
                    isActive: true,
                    parentId: null,
                    isHomePage: true
                }
            })

            // Ana sayfa içeriği oluştur
            const homePageContent = await prisma.pageContent.create({
                data: {
                    globalPageId: homePage.id,
                    languageId: turkishLanguage.id,
                    title: 'Anasayfa',
                    slug: 'anasayfa',
                    description: 'Web sitesinin anasayfası',
                    seoTitle: 'Anasayfa',
                    seoDescription: 'Web sitesinin anasayfası',
                    content: 'Hoş geldiniz! Bu sizin web sitenizin anasayfasıdır.'
                }
            })

            console.log(`✅ Default home page created: ${homePageContent.title}`)
        } else {
            // Order 0 olan sayfa var mı kontrol et
            const homePageExists = await prisma.globalPage.findFirst({
                where: {
                    order: 0,
                    isActive: true
                }
            })

            if (!homePageExists) {
                console.log('📝 Creating order 0 home page...')

                const homePage = await prisma.globalPage.create({
                    data: {
                        slug: `anasayfa-${Date.now()}`, // Unique slug için timestamp ekle
                        order: 0,
                        isActive: true,
                        parentId: null,
                        isHomePage: true
                    }
                })

                // Ana sayfa içeriği oluştur
                const homePageContent = await prisma.pageContent.create({
                    data: {
                        globalPageId: homePage.id,
                        languageId: turkishLanguage.id,
                        title: 'Anasayfa',
                        slug: 'anasayfa',
                        description: 'Web sitesinin anasayfası',
                        seoTitle: 'Anasayfa',
                        seoDescription: 'Web sitesinin anasayfası',
                        content: 'Hoş geldiniz! Bu sizin web sitenizin anasayfasıdır.'
                    }
                })

                console.log(`✅ Order 0 home page created: ${homePageContent.title}`)
            } else {
                console.log('✅ Home page already exists')
            }
        }

        // 4. Global Design ayarları oluştur (eğer yoksa)
        console.log('🎨 Checking global design settings...')
        const designCount = await prisma.globalDesign.count()

        if (designCount === 0) {
            console.log('📝 Creating default design settings...')
            const design = await prisma.globalDesign.create({
                data: {
                    titleFontSize: '36px',
                    titleFontWeight: '600',
                    titlePadding: '40px 0px',
                    paragraphFontSize: '14px',
                    paragraphFontWeight: '300',
                    buttonFontSize: '14px',
                    buttonFontWeight: '400',
                    buttonWidth: '140px',
                    menuFont: 'Poppins'
                }
            })
            console.log('✅ Default design settings created')
        } else {
            console.log('✅ Design settings already exist')
        }

        // 5. Global Logos ayarları oluştur (eğer yoksa)
        console.log('🖼️ Checking global logos settings...')
        const logosCount = await prisma.globalLogos.count()

        if (logosCount === 0) {
            console.log('📝 Creating default logos settings...')
            const logos = await prisma.globalLogos.create({
                data: {}
            })
            console.log('✅ Default logos settings created')
        } else {
            console.log('✅ Logos settings already exist')
        }

        console.log('🎉 Database seeding completed successfully!')

    } catch (error) {
        console.error('❌ Error during seeding:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 