import type { Metadata } from 'next'
import NavBar from '@/app/components/slicings/navbar';
import Footer from '@/app/components/slicings/footer';
import LegalPageRenderer from '@/app/components/static-pages/legal-page-renderer'
import type { LegalContent } from '@/app/components/static-pages/types'
import { getStaticPage } from '@/app/data/get-static-page'

const SLUG = 'kebijakan-refund'

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

export default async function RefundPolicyPage() {
  const page = await getStaticPage(SLUG)

  return (
    <>
      <NavBar />
      <LegalPageRenderer pageTitle={page.title} content={page.content as LegalContent} />
      <Footer />
    </>
  );
}
