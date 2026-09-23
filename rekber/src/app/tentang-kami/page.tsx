import type { Metadata } from 'next'
import NavBar from '../components/slicings/navbar';
import Footer from '../components/slicings/footer';
import AboutPageRenderer from '../components/static-pages/about-page-renderer'
import type { AboutContent } from '../components/static-pages/types'
import { getStaticPage } from '../data/get-static-page'

const SLUG = 'tentang-kami'

export const runtime = 'edge'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage(SLUG)
  const title = `${page.title} - Rekber.com`
  const description = page.meta_description || undefined

  return {
    title,
    description,
    alternates: {
      canonical: `/${SLUG}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.rekber.com/${SLUG}`,
      siteName: 'Rekber.com',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function AboutPage() {
  const page = await getStaticPage(SLUG)

  return (
    <>
      <NavBar />
      <AboutPageRenderer content={page.content as AboutContent} />
      <Footer />
    </>
  )
}
