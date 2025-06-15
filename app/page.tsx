import { redirect } from 'next/navigation'
import { getDefaultLanguage } from '@/lib/language-utils'

export default async function Home() {
  // Varsayılan dili al ve yönlendir
  const defaultLanguage = await getDefaultLanguage()

  if (defaultLanguage) {
    redirect(`/${defaultLanguage.code}`)
  } else {
    // Eğer varsayılan dil yoksa, Türkçe'ye yönlendir
    redirect('/tr')
  }
}
