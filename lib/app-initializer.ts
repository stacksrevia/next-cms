import { prisma } from './prisma'

export async function initializeApp() {
    try {
        console.log('🚀 Initializing app with Global Page Management...')

        // Dil kontrolü ve otomatik oluşturma
        let defaultLanguage = await prisma.language.findFirst({
            where: { isDefault: true }
        })

        if (!defaultLanguage) {
            console.log('📝 Creating default Turkish language...')
            defaultLanguage = await prisma.language.create({
                data: {
                    code: 'tr',
                    name: 'Türkçe',
                    flag: 'TR',
                    isDefault: true,
                    isActive: true
                }
            })
            console.log('✅ Created default language: Türkçe (tr)')
        }

        // Ana sayfa kontrolü
        const existingHomePage = await prisma.globalPage.findUnique({
            where: { slug: 'anasayfa' }
        })

        if (existingHomePage) {
            console.log('✅ App already initialized')
            return
        }

        // Ana sayfayı oluştur
        const homePage = await prisma.globalPage.create({
            data: {
                slug: 'anasayfa',
                parentId: null,
                order: 0,
                isActive: true,
                isHomePage: true
            }
        })

        // Ana sayfa içeriğini oluştur
        await prisma.pageContent.create({
            data: {
                globalPageId: homePage.id,
                languageId: defaultLanguage.id,
                title: 'Anasayfa',
                description: 'Web sitesinin anasayfası',
                slug: 'anasayfa',
                seoTitle: 'Anasayfa - Web Sitesi',
                seoDescription: 'Web sitesinin anasayfası'
            }
        })

        // Varsayılan modül ekle
        const pageContent = await prisma.pageContent.findFirst({
            where: {
                globalPageId: homePage.id,
                languageId: defaultLanguage.id
            }
        })

        if (pageContent) {
            await prisma.pageModule.create({
                data: {
                    pageContentId: pageContent.id,
                    languageId: defaultLanguage.id,
                    type: 'HERO',
                    content: {
                        title: 'Hoş Geldiniz',
                        subtitle: 'Modern ve dinamik web sitenize hoş geldiniz',
                        description: 'Bu alan tamamen özelleştirilebilir bir hero bölümüdür.',
                        buttonText: 'Keşfet',
                        buttonLink: '#',
                        backgroundImage: '',
                        backgroundColor: '#f8f9fa'
                    },
                    order: 0,
                    isActive: true
                }
            })
        }

        console.log('🎉 App initialization completed!')
    } catch (error) {
        console.error('❌ Error initializing app:', error)
    }
}

// Cleanup function
export async function disconnectPrisma() {
    await prisma.$disconnect()
} 